const User = require("../models/userModel");
const catchAync = require("../utils/catchAync");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const qs = require("qs");
const { promisify } = require("util");
const axios = require("axios");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

exports.signUp = catchAync(async (req, res, next) => {
  let colors = [
    "#EB673E",
    "#22BED2",
    "#3457d5",
    "#904BBB",
    "#F576B8",
    "#F5A024",
  ];
  let rand = Math.floor(Math.random() * colors.length);
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    name: req.body.firstName.trim() + " " + req.body.lastName.trim(),
    email: req.body.email,
    color: colors[rand],
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(user._id);

  if (process.env.NODE_ENV == "production") {
    user.password = undefined;
  }
  res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
    })
    .status(200)
    .json({
      status: "success",
      token,
    });
});

exports.login = catchAync(async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new AppError("Enter Email and Password", 400));
  }
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (user && (user.google || user.dauth)) {
    return next(new AppError("You can't login this email directly", 401));
  }

  if (!user || !(await user.checkPasswords(req.body.password, user.password))) {
    return next(new AppError("User name or Password Incorrect", 401));
  }

  const token = signToken(user._id);
  res
    .cookie("jwt", token, {
      httpOnly: true,
      expires: new Date(
        Date.now() +
          Number(process.env.JWT_COOKIE_EXPIRE_TIME) * 24 * 60 * 60 * 1000
      ),
      secure: process.env.NODE_ENV == "production",
    })
    .status(200)
    .json({
      status: "success",
      token,
    });
});

exports.loginWithGoogle = catchAync(async (req, res, next) => {
  const code = req.query.code;
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
    grant_type: "authorization_code",
  };

  const result = await axios.post(url, qs.stringify(values), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const { id_token, access_token } = result.data;

  const googleUser = jwt.decode(id_token);
  const user = await User.findOne({ email: googleUser.email });
  if (!user) {
    const myUser = {
      firstName: googleUser.name.split(" ")[0],
      lastName: googleUser.name.split(" ").slice(1).join(""),
      email: googleUser.email,
      profilePic: googleUser.picture,
      google: true,
    };
    const curUser = new User(myUser);
    curUser.save({ validateBeforeSave: false });
    const token = signToken(curUser._id);
    res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
      })
      .status(200)
      .redirect("/");
  } else if (user.google) {
    const token = signToken(user._id);
    if (process.env.NODE_ENV == "production") {
      user.password = undefined;
    }
    res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
      })
      .status(200)
      .redirect("/");
  } else {
    res.redirect(
      "/login?e=' + encodeURIComponent('You can't Login this email through google')"
    );
  }

  res.status(200).json({
    status: "success",
  });
});
exports.loginWithDelta = catchAync(async (req, res, next) => {
  const code = req.query.code;
  const url = "https://auth.delta.nitt.edu/api/oauth/token";

  const values = {
    code,
    client_id: process.env.DELTA_CLIENT_ID,
    client_secret: process.env.DELTA_CLIENT_SECRET,
    redirect_uri: process.env.DELTA_OAUTH_REDIRECT_URL,
    grant_type: "authorization_code",
  };

  const result = await axios.post(url, qs.stringify(values), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const { id_token, access_token, state } = result.data;

  const deltaRes = await axios.post(
    "https://auth.delta.nitt.edu/api/resources/user",
    {},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const deltaUser = deltaRes.data;

  const user = await User.findOne({ email: deltaUser.email });
  if (!user) {
    const myUser = {
      firstName: deltaUser.name.split(" ")[0],
      lastName: deltaUser.name.split(" ").slice(1).join(""),
      email: deltaUser.email,
      dauth: true,
    };
    const curUser = await new User(myUser);
    curUser.save({ validateBeforeSave: false });
    const token = signToken(curUser._id);
    res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
      })
      .status(200)
      .redirect("/");
  } else if (user.dauth) {
    const token = signToken(user._id);
    if (process.env.NODE_ENV == "production") {
      user.password = undefined;
    }
    res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
      })
      .status(200)
      .redirect("/");
  } else {
    res.redirect(
      "/login?e=' + encodeURIComponent('You can't Login this email through delta')"
    );
  }
  // const nitUser = jwt.decode(id_token);
  // console.log(nitUser);

  res.status(200).json({
    status: "success",
  });
});

exports.logout = catchAync(async (req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
});

exports.protect = catchAync(async (req, res, next) => {
  // const token = req.headers.split(' ')
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError("You must login to access this page", 403));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("The user with this credentials does not exist anymore", 401)
    );
  }
  req.user = user;
  next();
});

exports.isLoggedIn = catchAync(async (req, res, next) => {
  // const token = req.headers.split(' ')
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next();
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).populate("friends");
  if (!user) {
    return next();
  }
  req.isLoggedIn = true;
  res.locals.user = user;
  req.user = user;
  next();
});

exports.redirect = (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect(
      "/login?e=' + encodeURIComponent('Login to access this page')"
    );
  }
};

// exports.restrict = catchAync(async (req, res, next) => {
//   const user = await User.find(req.user.id);
//   if(req)
// });
