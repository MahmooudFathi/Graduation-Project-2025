export const isTokenExpired = () => {
  const loginTime = localStorage.getItem("loginTime");
  if (!loginTime) return true; 

  const ONE_HOUR = 60 * 60 * 1000; 
  const currentTime = Date.now();

  return currentTime - loginTime > ONE_HOUR; 
};
