const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationType: { type: String, default: 'info' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  address: { type: String, default: '' }
}, { _id: false });

const vehicleDetailsSchema = new mongoose.Schema({
  type: { type: String, enum: ['', 'car', 'bike'], default: '' },
  number: { type: String, default: '' }
}, { _id: false });

const ownerBusinessSchema = new mongoose.Schema({
  parkingName: { type: String, default: '' },
  ownerAddress: { type: String, default: '' },
  idProofUrl: { type: String, default: '' },
  gstNumber: { type: String, default: '' }
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' }
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  isVerified: { type: Boolean, default: false },
  submittedAt: { type: Date, default: null },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phoneNumber:    { type: String, default: '' },
  profileImage:   { type: String, default: '' },
  defaultLocation: { type: locationSchema, default: () => ({}) },
  vehicleDetails: { type: vehicleDetailsSchema, default: () => ({}) },
  ownerBusiness:  { type: ownerBusinessSchema, default: () => ({}) },
  bankDetails:    { type: bankDetailsSchema, default: () => ({}) },
  verification:   { type: verificationSchema, default: () => ({}) },
  vehicleType:    { type: String, enum: ['', 'Car', 'Bike'], default: '' },
  vehicleNumber:  { type: String, default: '' },
  location:       { type: String, default: '' },
  isProfileComplete: { type: Boolean, default: false },
  requestCount:   { type: Number, default: 0 },
  lastRequestTime:{ type: Date },
  isSuspicious:   { type: Boolean, default: false },
  notifications: [notificationSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);