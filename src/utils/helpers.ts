export const getUserInfo = () => {
	const ua = navigator.userAgent;
	let os = "Unknown OS";
	let browser = "Unknown Browser";

	if (ua.indexOf("Win") !== -1) os = "Windows";
	else if (ua.indexOf("Mac") !== -1) os = "MacOS";
	else if (ua.indexOf("X11") !== -1) os = "UNIX";
	else if (ua.indexOf("Linux") !== -1) os = "Linux";
	else if (/Android/.test(ua)) os = "Android";
	else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

	if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
	else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
	else if (ua.indexOf("Safari") !== -1) browser = "Safari";
	else if (ua.indexOf("MSIE") !== -1 || !!document.documentMode) {
		browser = "IE";
	}

	const isMobile = /Mobi|Android|iPhone/i.test(ua);

	return {
		userAgent: ua,
		os,
		browser,
		device: isMobile ? "mobile" : "desktop",
		language: navigator.language,
		screenResolution: `${screen.width}x${screen.height}`,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	};
};

export const getUserIPAndGeo = async () => {
	try {
		const response = await fetch("https://ipapi.co/json/", {
			method: "GET",
			mode: "cors",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) throw new Error("Geo API failed");

		return await response.json();
	} catch (error) {
		return { ip: "", country_name: "", city: "", region: "" };
	}
};

export const getLoadingTime = (): number => {
	const navigationEntry = performance.getEntriesByType(
		"navigation",
	)[0] as PerformanceNavigationTiming;

	return navigationEntry ? Math.round(navigationEntry.loadEventEnd) : 0;
};

export const captureTrafficSource = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const utmParams = ["utm_source", "utm_medium", "utm_campaign"];

	let trafficData = JSON.parse(
		sessionStorage.getItem("portfolio_analytics") || "{}",
	);
	let hasNewUtms = false;

	const visitor_id = sessionStorage.getItem("visitor_id");

	utmParams.forEach((param) => {
		if (urlParams.has(param)) {
			trafficData[param] = urlParams.get(param);
			hasNewUtms = true;
		}
	});

	if (document.referrer) {
		try {
			const referrerURL = new URL(document.referrer);
			if (
				referrerURL.hostname !== window.location.hostname &&
				!trafficData.referrer
			) {
				trafficData.referrer = document.referrer;
			}
		} catch (e) {}
	}

	if (hasNewUtms || trafficData.referrer) {
		sessionStorage.setItem(
			"portfolio_analytics",
			JSON.stringify(trafficData),
		);
	}

	return { isNewSession: !visitor_id };
};

export const initializeAnalytics = async () => {
	const { isNewSession } = captureTrafficSource();

	if (!isNewSession) {
		const visitor_id = sessionStorage.getItem("visitor_id");

		// Track page
		return;
	}

	try {
		const visitPayload = await saveVisit();

		const response = null; // Make request to create visitor

		if (!response?.ok) throw new Error("Failed to register session");

		const result = await response.json();

		if (result.message && result.success === false) {
			throw new Error(result.message);
		}

		sessionStorage.setItem("visitor_id", result.id);

		// Track page
	} catch (error) {
		console.error(error);
	}
};

export const saveVisit = async () => {
	captureTrafficSource();

	const userInfo = getUserInfo();
	const ipAndGeo = await getUserIPAndGeo();
	const loadTime = getLoadingTime();

	const trafficData = JSON.parse(
		sessionStorage.getItem("portfolio_analytics") || "{}",
	);

	const visitInfo = {
		ip_address: ipAndGeo.ip || "",
		user_agent: userInfo.userAgent,
		country: ipAndGeo.country_name || "",
		city: ipAndGeo.city || "",
		region: ipAndGeo.region || "",
		os: userInfo.os,
		browser: userInfo.browser,
		language: userInfo.language,
		device: userInfo.device,
		screen_resolution: userInfo.screenResolution,
		referrer: trafficData.referrer || "",
		utm_source: trafficData.utm_source || "",
		utm_medium: trafficData.utm_medium || "",
		utm_campaign: trafficData.utm_campaign || "",
		loading_time: loadTime,
	};

	return visitInfo;
};
