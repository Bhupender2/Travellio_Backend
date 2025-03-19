class APIFeatures {   //REFACTORING API IN BETTER WAY
    constructor(query, queryObj) {
        this.query = query,
        this.queryObj = queryObj
    }

    filter() {
        const QueryObj = { ...this.queryObj };
        const excludeFields = ['page', 'limit', 'sort', 'fields'];
        excludeFields.forEach((elem) => delete QueryObj[elem]);

        let queryStr = JSON.stringify(QueryObj);
        queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

        this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.queryObj.sort) {
            const sortBy = this.queryObj.sort.split(",").join(" ");
            this.query.sort(sortBy)
        } else this.query.sort('-createdAt')

        return this;
    }

    fields() {
        if (this.queryObj.fields) {
            const fields = this.queryObj.fields.split(",").join(" ")
            this.query.select(fields)
        } else this.query.select('-__v')

        return this;
    }

    pagination() {
        const page = this.queryObj.page * 1 || 1;
        const limit = this.queryObj.limit * 1 || 5;
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit)

        return this;
    }

}

module.exports = APIFeatures;