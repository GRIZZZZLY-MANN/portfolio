/* ── Место SPA · логика заявки ─────────────────────────────────── */

(function () {
	"use strict";
	const err_name = document.getElementById(`error-name`);
	const err_program = document.getElementById(`error-program`);
	const err_date = document.getElementById(`error-date`);
	var STORAGE_KEY = "mesto-spa-application";

	var PROGRAMS = {
		restart: { title: "Перезагрузка", duration: "60 минут", price: "3 500 ₽" },
		deep: { title: "Глубокий отдых", duration: "90 минут", price: "5 000 ₽" },
		duo: { title: "Для двоих", duration: "120 минут", price: "9 000 ₽" },
	};
	const lettersOnlyRegex = /^[\p{L}]+$/u;
	var form = document.getElementById("booking-form");
	var nameInput = document.getElementById("field-name");
	var programSelect = document.getElementById("field-program");
	var dateInput = document.getElementById("field-date");
	var confirmation = document.getElementById("confirmation");
	var newBtn = document.getElementById("new-application");

	/* Минимальная дата — сегодня (прошедшие даты запрещены) */
	function todayISO() {
		var d = new Date();
		var m = String(d.getMonth() + 1).padStart(2, "0");
		var day = String(d.getDate()).padStart(2, "0");
		return d.getFullYear() + "-" + m + "-" + day;
	}
	dateInput.min = todayISO();

	/* Кнопки «Выбрать программу» на карточках */
	document.querySelectorAll("[data-program]").forEach(function (btn) {
		btn.addEventListener("click", function () {
			programSelect.value = btn.getAttribute("data-program");
			clearError(programSelect);
			form.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(function () {
				nameInput.focus({ preventScroll: true });
			}, 450);
		});
	});

	/* ── Валидация ── */

	function setError(input, message) {
		var field = input.closest(".field");
		var errorEl = document.getElementById(
			"error-" + input.id.replace("field-", ""),
		);
		field.classList.add("has-error");
		input.setAttribute("aria-invalid", "true");
		errorEl.textContent = message;
		errorEl.hidden = false;
	}

	function clearError(input) {
		var field = input.closest(".field");
		var errorEl = document.getElementById(
			"error-" + input.id.replace("field-", ""),
		);
		field.classList.remove("has-error");
		input.removeAttribute("aria-invalid");
		errorEl.textContent = "";
		errorEl.hidden = true;
	}

	function validate() {
		var firstBad = null;

		if (!nameInput.value.trim()) {
			err_name.classList.remove(`hidden`);
			setError(nameInput, "Пожалуйста, представьтесь — как к вам обращаться?");

			firstBad = firstBad || nameInput;
		} else if (!lettersOnlyRegex.test(nameInput.value)) {
			err_name.classList.remove(`hidden`);
			setError(nameInput, "Пожалуйста, введите ваше имя");
			firstBad = firstBad || nameInput;
		} else {
			clearError(nameInput);
		}

		if (!programSelect.value) {
			err_program.classList.remove(`hidden`);
			setError(programSelect, "Выберите программу — одну из трёх выше.");
			firstBad = firstBad || programSelect;
		} else {
			clearError(programSelect);
		}

		if (!dateInput.value) {
			err_date.classList.remove(`hidden`);
			setError(dateInput, "Укажите желаемую дату визита.");
			firstBad = firstBad || dateInput;
		} else if (dateInput.value < todayISO()) {
			err_date.classList.remove(`hidden`);
			setError(
				dateInput,
				"Эта дата уже прошла — выберите сегодняшнюю или будущую.",
			);
			firstBad = firstBad || dateInput;
		} else {
			clearError(dateInput);
		}

		if (firstBad) firstBad.focus();
		return !firstBad;
	}

	[nameInput, programSelect, dateInput].forEach(function (input) {
		input.addEventListener("input", function () {
			clearError(input);
		});
		input.addEventListener("change", function () {
			clearError(input);
		});
	});

	/* ── Отправка ── */

	function formatDate(iso) {
		var parts = iso.split("-");
		var months = [
			"января",
			"февраля",
			"марта",
			"апреля",
			"мая",
			"июня",
			"июля",
			"августа",
			"сентября",
			"октября",
			"ноября",
			"декабря",
		];
		return (
			Number(parts[2]) + " " + months[Number(parts[1]) - 1] + " " + parts[0]
		);
	}

	form.addEventListener("submit", function (e) {
		e.preventDefault();
		if (!validate()) return;

		var program = PROGRAMS[programSelect.value];
		var application = {
			id: Date.now().toString(36).toUpperCase().slice(-6),
			createdAt: new Date().toISOString(),
			name: nameInput.value.trim(),
			programKey: programSelect.value,
			program: program.title,
			duration: program.duration,
			price: program.price,
			date: dateInput.value,
		};

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(application));
			err_date.classList.add(`hidden`);
			err_program.classList.add(`hidden`);
			err_name.classList.add(`hidden`);
		} catch (err) {
			/* localStorage может быть недоступен — показываем подтверждение всё равно */
		}

		showConfirmation(application);
	});

	function showConfirmation(app) {
		document.getElementById("conf-name").textContent = app.name;
		document.getElementById("conf-program").textContent =
			app.program + " · " + app.duration + " · " + app.price;
		document.getElementById("conf-date").textContent = formatDate(app.date);
		document.getElementById("conf-id").textContent = app.id;

		form.hidden = true;
		confirmation.hidden = false;
		confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
	}

	newBtn.addEventListener("click", function () {
		form.reset();
		[nameInput, programSelect, dateInput].forEach(clearError);
		confirmation.hidden = true;
		form.hidden = false;
		form.scrollIntoView({ behavior: "smooth", block: "center" });
	});

	/* ── Восстановление последней заявки после перезагрузки ── */

	try {
		var saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			var app = JSON.parse(saved);
			if (app && app.name && app.program && app.date) {
				showConfirmation(app);
			}
		}
	} catch (err) {
		/* повреждённые данные — просто игнорируем */
	}
})();

/* ── Карусель зон студии ─────────────────────────────────────────── */

(function () {
	"use strict";

	var carousel = document.getElementById("carousel");
	if (!carousel) return;

	var viewport = document.getElementById("carousel-viewport");
	var track = document.getElementById("carousel-track");
	var dotsWrap = document.getElementById("carousel-dots");
	var slides = Array.prototype.slice.call(track.children);
	var index = 0;
	var timer = null;
	var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* Точки навигации */
	slides.forEach(function (_, i) {
		var dot = document.createElement("button");
		dot.type = "button";
		dot.className = "dot";
		dot.setAttribute("aria-label", "Зона " + (i + 1) + " из " + slides.length);
		dot.addEventListener("click", function () {
			goTo(i);
			restartAutoplay();
		});
		dotsWrap.appendChild(dot);
	});
	var dots = Array.prototype.slice.call(dotsWrap.children);

	function goTo(i) {
		index = (i + slides.length) % slides.length;
		track.style.transform = "translateX(-" + index * 100 + "%)";
		dots.forEach(function (dot, di) {
			dot.classList.toggle("active", di === index);
			if (di === index) dot.setAttribute("aria-current", "true");
			else dot.removeAttribute("aria-current");
		});
		slides.forEach(function (slide, si) {
			slide.setAttribute("aria-hidden", si === index ? "false" : "true");
		});
	}

	function next() {
		goTo(index + 1);
	}
	function prev() {
		goTo(index - 1);
	}

	document
		.getElementById("carousel-next")
		.addEventListener("click", function () {
			next();
			restartAutoplay();
		});
	document
		.getElementById("carousel-prev")
		.addEventListener("click", function () {
			prev();
			restartAutoplay();
		});

	/* Стрелки клавиатуры, когда карусель в фокусе */
	carousel.addEventListener("keydown", function (e) {
		if (e.key === "ArrowLeft") {
			prev();
			restartAutoplay();
		} else if (e.key === "ArrowRight") {
			next();
			restartAutoplay();
		}
	});

	/* Свайп на тач-экранах */
	var startX = null;
	viewport.addEventListener("pointerdown", function (e) {
		startX = e.clientX;
	});
	viewport.addEventListener("pointerup", function (e) {
		if (startX === null) return;
		var dx = e.clientX - startX;
		if (Math.abs(dx) > 40) {
			if (dx < 0) next();
			else prev();
			restartAutoplay();
		}
		startX = null;
	});

	/* Автопрокрутка: пауза при наведении, фокусе и уходе вкладки */
	function startAutoplay() {
		if (reduced || timer) return;
		timer = setInterval(next, 6500);
	}
	function stopAutoplay() {
		clearInterval(timer);
		timer = null;
	}
	function restartAutoplay() {
		stopAutoplay();
		startAutoplay();
	}

	carousel.addEventListener("mouseenter", stopAutoplay);
	carousel.addEventListener("mouseleave", startAutoplay);
	carousel.addEventListener("focusin", stopAutoplay);
	carousel.addEventListener("focusout", startAutoplay);
	document.addEventListener("visibilitychange", function () {
		if (document.hidden) stopAutoplay();
		else startAutoplay();
	});

	goTo(0);
	startAutoplay();
})();
