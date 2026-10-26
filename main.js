document.addEventListener("DOMContentLoaded", () => {
	const sections = document.querySelectorAll("section");
	const navLinks = document.querySelectorAll(".menu-link");

	const observerOptions = {
		root: null,
		// Секция считается активной, когда она занимает 60% экрана
		threshold: 0.4,
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				// Получаем id видимой секции
				const id = entry.target.getAttribute("id");

				// Удаляем класс active у всех ссылок и добавляем нужной
				navLinks.forEach((link) => {
					if (link.getAttribute("href") === `#${id}`) {
						link.classList.add("active");
					} else {
						link.classList.remove("active");
					}
				});
			}
		});
	}, observerOptions);

	// Запускаем слежку за каждой секцией
	sections.forEach((section) => observer.observe(section));
});
const PROJECTS = [
	{
		slug: "mesto", // имя папки в demos/
		title: "Место SPA",
		desc: "Сайт салона красоты: запись, отзывы, адаптив.",
		tags: ["JS", "CSS Grid"],
		img: "img/mesto.png", // превью (необязательно)
	},
	{
		slug: "cars", // имя папки в demos/
		title: "D&M Leasing",
		desc: "Многостраничный сайт лизинговой компании, вёрстка и дизайн ",
		tags: ["JS", "CSS", "Adaptive layout"],
		img: "img/cars.png", // превью (необязательно)
	},
	// ↓ новый проект = один такой объект
];
const grid = document.getElementById("projects-grid");

grid.innerHTML = PROJECTS.map(
	(p) => `
  <article class="project-card">
    <a class="project-thumb" href="demos/${p.slug}/" target="_blank" rel="noopener">
      ${
				p.img
					? `<img src="${p.img}" alt="Скриншот: ${p.title}" loading="lazy">`
					: `<span>${p.title}</span>`
			}
    </a>
    <div class="project-body">
      <div class="tags">${p.tags.map((t) => `<span class="tag chip">${t}</span>`).join("")}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <a class="demo-link" href="demos/${p.slug}/" target="_blank" rel="noopener">Открыть демо ↗</a>
    </div>
  </article>
`,
).join("");
