const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const productModel = require("../models/productModel");
const path = require("path");
const reviewsModel = require("../models/Reviews");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await productModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await productModel.find({});
  res.status(StatusCodes.OK).json({ products });
};

const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findOne({ _id: id });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findOne({ _id: id });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${id}`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed!" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("Please upload image");
  }
  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload file type image");
  }
  const imagePath = path.join(
    __dirname + "/../public/uploads/" + `${productImage.name}`
  );
  productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ path: imagePath });
};

const getProductReviews = async (req, res) => {
  const { id } = req.params;
  const reviews = await reviewsModel.find({ product: id });
  res.status(StatusCodes.OK).json(reviews);
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getProductReviews,
};
