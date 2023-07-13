module.exports = class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryString = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'fields', 'sort', 'limit'];
    excludedFields.forEach(ele => delete queryObj[ele]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortField = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortField);
    } else {
      this.query = this.query.sort('createdAt name');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
