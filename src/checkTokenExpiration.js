export const isTokenExpired = () => {
  const loginTime = localStorage.getItem("loginTime");
  if (!loginTime) return true; 

  const Quarter_HOUR = 15 * 60 * 1000; 
  const currentTime = Date.now();

  return currentTime - loginTime > Quarter_HOUR;
};
