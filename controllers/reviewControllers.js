const reviewsModel = require("../models/Reviews");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  checkPermission,
} = require("../utils");
const productModel = require("../models/productModel");

const createReview = async (req, res) => {
  const { product } = req.body;
  const productExist = await productModel.findOne({ _id: product });
  if (!productExist) {
    throw new CustomError.NotFoundError(`No product found with id: ${product}`);
  }
  const alreadyExit = await reviewsModel.findOne({
    product,
    user: req.body.user,
  });
  if (alreadyExit) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product"
    );
  }
  req.body.user = req.user.userId;
  const review = await reviewsModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await reviewsModel.find({}).populate({
    path: "product",
    select: "name company price",
  });
  res.status(StatusCodes.OK).json({ reviews });
};

const getSingleReview = async (req, res) => {
  const { id } = req.params;
  const review = await reviewsModel.findOne({ _id: id });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id: ${id}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id } = req.params;
  const { title, comment, rating } = req.body;
  const review = await reviewsModel.findOne({ _id: id });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id: ${id}`);
  }
  checkPermission(req.user, review.user);
  review.title = title;
  review.comment = comment;
  review.rating = rating;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await reviewsModel.findOne({ _id: id });
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id: ${id}`);
  }
  checkPermission(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Review deleted." });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
