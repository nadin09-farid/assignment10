export function generateOTP () {
    return Math.ceil(Math.random() * 900000 + 100000).toString();
};