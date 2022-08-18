const mongoose = require("mongoose");

const reviewsSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      required: [true, "Please provide review title"],
      maxlength: [100, "Title can not be more than 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Please provide review comment"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "productModel",
      required: true,
    },
  },
  { timestamps: true }
);
reviewsSchema.index({ product: 1, user: 1 }, { unique: true });

reviewsSchema.statics.calculateAverageRating = async function (productID) {
  const result = await this.aggregate([
    {
      $match: {
        product: productID,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  try {
    await this.model("productModel").findOneAndUpdate(
      { _id: productID },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

reviewsSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
reviewsSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("reviewsModel", reviewsSchema);
