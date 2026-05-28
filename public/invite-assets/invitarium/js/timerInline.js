class Timer {
    constructor(element, endDate = null, units = []) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("Element must be an HTMLElement");
        }

        this.endDate =
            endDate instanceof Date && !isNaN(endDate) ? endDate : null;

        if (
            !Array.isArray(units) ||
            !units.every((unit) => typeof unit === "string")
        ) {
            throw new Error("Units must be an array of strings");
        }

        this.element = element;
        this.units = units;
        this.intervalId = null;

        this.resizeHandler = this.adjustFontSize.bind(this);
        window.addEventListener("resize", this.resizeHandler);

        this.validUnits = [
            "years",
            "months",
            "weeks",
            "days",
            "hours",
            "minutes",
            "seconds",
        ];

        this.units.forEach((unit) => {
            if (!this.validUnits.includes(unit)) {
                throw new Error(
                    `Invalid unit: ${unit}. Valid units are: ${this.validUnits.join(
                        ", "
                    )}`
                );
            }
        });

        this.start();
    }

    calculateTimeDifference() {
        const timeUnits = {
            years: 0,
            months: 0,
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };

        if (!this.endDate) {
            return timeUnits;
        }

        const now = new Date();
        let timeDiff = Math.max(0, this.endDate - now);

        if (this.units.includes("years")) {
            timeUnits.years = Math.floor(
                timeDiff / (1000 * 60 * 60 * 24 * 365)
            );
            timeDiff -= timeUnits.years * (1000 * 60 * 60 * 24 * 365);
        }

        if (this.units.includes("months")) {
            timeUnits.months = Math.floor(
                timeDiff / (1000 * 60 * 60 * 24 * 30)
            );
            timeDiff -= timeUnits.months * (1000 * 60 * 60 * 24 * 30);
        }

        if (this.units.includes("weeks")) {
            timeUnits.weeks = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
            timeDiff -= timeUnits.weeks * (1000 * 60 * 60 * 24 * 7);
        }

        if (this.units.includes("days")) {
            timeUnits.days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            timeDiff -= timeUnits.days * (1000 * 60 * 60 * 24);
        }

        if (this.units.includes("hours")) {
            timeUnits.hours = Math.floor(timeDiff / (1000 * 60 * 60));
            timeDiff -= timeUnits.hours * (1000 * 60 * 60);
        }

        if (this.units.includes("minutes")) {
            timeUnits.minutes = Math.floor(timeDiff / (1000 * 60));
            timeDiff -= timeUnits.minutes * (1000 * 60);
        }

        if (this.units.includes("seconds")) {
            timeUnits.seconds = Math.floor(timeDiff / 1000);
        }

        return timeUnits;
    }

    render() {
        const timeUnits = this.calculateTimeDifference();

        // Проверяем, существует ли уже структура HTML
        const existingUnits = this.element.querySelectorAll(".countdown-unit");

        if (existingUnits.length > 0) {
            // Если структура уже есть, просто обновляем значения и видимость

            // Сначала обновляем все значения
            existingUnits.forEach((unitElement) => {
                const unit = unitElement.getAttribute("data-unit");
                if (unit && timeUnits.hasOwnProperty(unit)) {
                    const valueElement =
                        unitElement.querySelector(".countdown-value");
                    if (valueElement) {
                        valueElement.textContent = String(
                            timeUnits[unit]
                        ).padStart(2, "0");
                    }
                }
            });

            // Управляем видимостью элементов на основе активных units
            const visibleUnits = [];
            existingUnits.forEach((unitElement) => {
                const unit = unitElement.getAttribute("data-unit");
                if (unit && this.units.includes(unit)) {
                    unitElement.style.display = "";
                    visibleUnits.push(unitElement);
                } else {
                    unitElement.style.display = "none";
                }
            });

            // Управляем видимостью разделителей
            const allElements = Array.from(this.element.children);
            allElements.forEach((element) => {
                if (element.classList.contains("countdown-separator")) {
                    element.style.display = "none";
                }
            });

            // Показываем разделители между видимыми элементами
            visibleUnits.forEach((unitElement, index) => {
                if (index < visibleUnits.length - 1) {
                    const nextSeparator = unitElement.nextElementSibling;
                    if (
                        nextSeparator &&
                        nextSeparator.classList.contains("countdown-separator")
                    ) {
                        nextSeparator.style.display = "";
                    }
                }
            });

            // Обновляем класс для последнего видимого элемента
            existingUnits.forEach((unitElement) => {
                unitElement.classList.remove("countdown-unit--last");
            });
            if (visibleUnits.length > 0) {
                visibleUnits[visibleUnits.length - 1].classList.add(
                    "countdown-unit--last"
                );
            }
        } else {
            // Если структуры нет, создаем её с нуля
            this.createInitialStructure(timeUnits);
        }

        this.adjustFontSize();
    }

    adjustFontSize() {
        const originalHtml = this.element.innerHTML;
        this.element.style.fontSize = "";

        const containerWidth = this.element.clientWidth;
        const containerHeight = this.element.clientHeight;

        if (containerWidth <= 0 || containerHeight <= 0) return;

        const fitsContainer = () => {
            const children = Array.from(this.element.children);
            const totalWidth = children.reduce(
                (sum, child) => sum + child.offsetWidth,
                0
            );
            return totalWidth <= containerWidth;
        };

        let minSize = 8;
        let maxSize = 100;
        let optimalSize =
            parseInt(window.getComputedStyle(this.element).fontSize) || 16;

        this.element.style.fontSize = `${maxSize}px`;
        if (fitsContainer()) {
            optimalSize = maxSize;
        } else {
            while (maxSize - minSize > 1) {
                const midSize = Math.floor((minSize + maxSize) / 2);
                this.element.style.fontSize = `${midSize}px`;

                if (fitsContainer()) {
                    minSize = midSize;
                    optimalSize = midSize;
                } else {
                    maxSize = midSize;
                }
            }
        }

        this.element.style.fontSize = `${optimalSize}px`;

        const valueElements = this.element.querySelectorAll(
            ".countdown-value, .countdown-separator"
        );
        valueElements.forEach((el) => {
            el.style.fontSize = `${optimalSize}px`;
        });

        const labelElements = this.element.querySelectorAll(".countdown-label");
        labelElements.forEach((el) => {
            el.style.fontSize = `${Math.max(
                10,
                Math.floor(optimalSize * 0.6)
            )}px`;
        });

        if (this.element.innerHTML !== originalHtml) {
            this.element.innerHTML = originalHtml;
        }

        const finalSize = Math.floor(optimalSize * 0.95);
        this.element.style.fontSize = `${finalSize}px`;
        valueElements.forEach((el) => {
            el.style.fontSize = `${finalSize}px`;
        });
    }

    start() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.render();

        if (this.endDate) {
            this.intervalId = setInterval(() => {
                const now = new Date();
                if (now >= this.endDate) {
                    clearInterval(this.intervalId);
                    this.render();
                    return;
                }

                this.render();
                this.adjustFontSize();
            }, 1000);
        }
    }

    setEndDate(newEndDate) {
        if (!(newEndDate instanceof Date) || isNaN(newEndDate)) {
            throw new Error("New end date must be a valid Date object");
        }
        this.endDate = newEndDate;
        this.start();
    }

    setUnits(newUnits) {
        if (
            !Array.isArray(newUnits) ||
            !newUnits.every((unit) => typeof unit === "string")
        ) {
            throw new Error("New units must be an array of strings");
        }

        newUnits.forEach((unit) => {
            if (!this.validUnits.includes(unit)) {
                throw new Error(
                    `Invalid unit: ${unit}. Valid units are: ${this.validUnits.join(
                        ", "
                    )}`
                );
            }
        });

        this.units = newUnits;
        this.start();
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        window.removeEventListener("resize", this.resizeHandler);
    }
}
