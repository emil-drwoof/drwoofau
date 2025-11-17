document.addEventListener("DOMContentLoaded", function () {
  
  let hasRedirected = false;
  let geoCheckResult = null;
  
  // Fetch with timeout to prevent hanging
  function fetchWithTimeout(url, timeout = 3000) {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Geo API timeout')), timeout)
      )
    ]);
  }
  
  // Get country code with fallback
  async function getCountryCode() {
    try {
      // Try GeoJS first (no rate limits)
      const response = await fetchWithTimeout('https://get.geojs.io/v1/ip/country.json', 3000);
      const data = await response.json();
      return data.country; // Returns "SG", "NZ", "HK", "AU", etc.
    } catch (error) {
      console.log('GeoJS failed, trying fallback...');
      try {
        // Fallback to ip-api.com (45 requests/minute)
        const response = await fetchWithTimeout('http://ip-api.com/json/', 3000);
        const data = await response.json();
        return data.countryCode; // Returns "SG", "NZ", "HK", "AU", etc.
      } catch (fallbackError) {
        console.error('Both geo services failed');
        return null;
      }
    }
  }
  
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  
  function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return "";
  }

  function getCurrentRegionFromURL() {
    const path = window.location.pathname;
    if (path.startsWith('/en-nz')) return 'NZ';
    if (path.startsWith('/en-sg')) return 'SG';
    if (path.startsWith('/en-hk')) return 'HK';
    return 'AU';
  }

  function getRegionalURL(countryCode) {
    const currentPath = window.location.pathname;
    const searchParams = window.location.search;
    const hash = window.location.hash;
    
    let cleanPath = currentPath.replace(/^\/(en-nz|en-sg|en-hk)/, '');
    
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    
    let regionalPrefix = '';
    switch(countryCode) {
      case 'NZ':
        regionalPrefix = '/en-nz';
        break;
      case 'SG':
        regionalPrefix = '/en-sg';
        break;
      case 'HK':
        regionalPrefix = '/en-hk';
        break;
      default:
        regionalPrefix = '';
    }
    
    return `https://drwoofapparel.com.au${regionalPrefix}${cleanPath}${searchParams}${hash}`;
  }
  
  function processGeoData(countryCode, isSecondCheck = false) {
    const cookieName = "regionPreference";
    const locationCookieName = "lastDetectedCountry";
    const cookieDays = 30;
    
    if (!countryCode) {
      return; // Failed to get country code
    }
    
    // Determine expected region based on country
    let expectedRegion = 'AU';
    if (countryCode === 'NZ') {
      expectedRegion = 'NZ';
    } else if (countryCode === 'SG') {
      expectedRegion = 'SG';
    } else if (countryCode === 'HK') {
      expectedRegion = 'HK';
    }
    
    // Only process NZ, SG, HK users
    if (expectedRegion === 'AU') {
      return;
    }
    
    const savedPreference = getCookie(cookieName);
    const lastDetectedCountry = getCookie(locationCookieName);
    const currentRegion = getCurrentRegionFromURL();
    const locationChanged = lastDetectedCountry && lastDetectedCountry !== countryCode;
    
    // Update location cookie
    setCookie(locationCookieName, countryCode, cookieDays);
    
    // Scenario 1: Location changed
    if (locationChanged) {
      setCookie(cookieName, expectedRegion, cookieDays);
      if (currentRegion !== expectedRegion) {
        hasRedirected = true;
        window.location.href = getRegionalURL(expectedRegion);
      }
      return;
    }
    
    // Scenario 2: First visit
    if (!savedPreference) {
      setCookie(cookieName, expectedRegion, cookieDays);
      if (currentRegion !== expectedRegion) {
        hasRedirected = true;
        window.location.href = getRegionalURL(expectedRegion);
      }
      return;
    }
    
    // Scenario 3: Has saved preference but on wrong store
    if (savedPreference !== 'AU' && savedPreference !== currentRegion) {
      hasRedirected = true;
      window.location.href = getRegionalURL(savedPreference);
    }
  }
  
  async function runGeoCheck(isSecondCheck = false) {
    // Early exit if already redirected
    if (hasRedirected) {
      return;
    }
    
    // Skip redirect on /pages/ URLs
    if (window.location.pathname.startsWith('/pages/')) {
      return;
    }
    
    try {
      // Use cached result on second check if available
      if (isSecondCheck && geoCheckResult) {
        processGeoData(geoCheckResult, true);
        return;
      }
      
      // Get country code from geo services
      const countryCode = await getCountryCode();
      
      // Cache result for second check
      if (!isSecondCheck) {
        geoCheckResult = countryCode;
      }
      
      processGeoData(countryCode, isSecondCheck);
      
    } catch (error) {
      // Silent fail - don't break the page if geo-detection fails
      console.error('Geo-detection error:', error);
    }
  }
  
  // First check - run immediately
  runGeoCheck(false);
  
  // Second check - run after 2 seconds
  setTimeout(function() {
    runGeoCheck(true);
  }, 2000);
  
  // Manual currency change handler
  const currencySelector = document.getElementById("CurrencySelector");
  if (currencySelector) {
    currencySelector.addEventListener("change", function () {
      const newCurrency = this.value;
      fetch(`/currency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ currency: newCurrency })
      }).then(() => {
        location.reload();
      });
    });
  }
  
});