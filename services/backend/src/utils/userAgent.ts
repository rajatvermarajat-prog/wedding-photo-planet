import { Request } from 'express';
import { ClientDeviceInfo } from '../types';

export const extractDeviceInfo = (req: Request): ClientDeviceInfo => {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Extract client IP address accurately handling reverse proxies
  const forwarded = req.headers['x-forwarded-for'];
  let ipAddress = '127.0.0.1';
  if (typeof forwarded === 'string') {
    ipAddress = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ipAddress = forwarded[0].trim();
  } else if (req.socket.remoteAddress) {
    ipAddress = req.socket.remoteAddress.replace(/^.*:/, '');
  }

  // Basic parser for browser
  let browser = 'Unknown Browser';
  if (/edg/i.test(userAgent)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(userAgent)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Apple Safari';
  else if (/opera|opr/i.test(userAgent)) browser = 'Opera';

  // Basic parser for OS
  let os = 'Unknown OS';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  // Basic parser for device
  let device = 'Desktop';
  if (/mobile/i.test(userAgent)) device = 'Mobile';
  else if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';

  return {
    ipAddress,
    userAgent,
    browser,
    os,
    device,
  };
};
