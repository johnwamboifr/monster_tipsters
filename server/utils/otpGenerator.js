const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString().substring(0, 6);
};

export default generateOtp;
