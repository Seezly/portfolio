(() => {
	const init = () => {
		const stickyLinks = document.getElementById("sticky-links");
		const nonStickyLinks = document.getElementById("nonsticky-links");
		const nonStickyRole = document.getElementById("nonsticky-role");
		const hero = document.getElementById("hero");

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						stickyLinks.classList.add(
							"invisible",
							"opacity-0",
							"pointer-events-none"
						);
						nonStickyLinks.classList.remove(
							"invisible",
							"opacity-0",
							"pointer-events-none",
							"w-[0px]"
						);
						nonStickyRole.classList.remove(
							"invisible",
							"opacity-0",
							"pointer-events-none",
							"w-[0px]"
						);
					} else {
						stickyLinks.classList.remove(
							"invisible",
							"opacity-0",
							"pointer-events-none"
						);
						nonStickyLinks.classList.add(
							"invisible",
							"opacity-0",
							"pointer-events-none",
							"w-[0px]"
						);
						nonStickyRole.classList.add(
							"invisible",
							"opacity-0",
							"pointer-events-none",
							"w-[0px]"
						);
					}
				});
			},
			{ threshold: 0 }
		);

		observer.observe(hero);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
