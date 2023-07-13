// Add css for invalid class
const style = document.createElement("style");
style.innerHTML = `
.invalid {
    color: red;
}

.invalid span {
    font-size: 14px;
    margin-left: 5px;
}

.invalid input {
    border: 1px solid red;
}

.invalid input::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: red;
    opacity: 1; /* Firefox */
}

.invalid input:-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: red;
}

.invalid input::-ms-input-placeholder {
    /* Microsoft Edge */
    color: red;
}
`;
document.head.appendChild(style);

/**
 * option {
 *      form: "#form", // form cần validate
 *      errorSelector: ".form-message" // nơi hiển thị thông báo khi gặp lỗi
 *      rules: {
 *          // phương thức validate input
 *          test method (Validate.method)
 *          ...
 *      },
 *      // optional for javascript
 *      onSubmit: (data) => {
 *          console.log(data);
 *      }
 * }
 *
 * @param {*} options
 */
const Validator = (options) => {
    let selectorRules = {};

    // Hàm thực hiện validate
    const validate = (inputElem, errorElem, rule) => {
        const rules = selectorRules[rule.selector];

        let errMess;
        for (let i = 0; i < rules.length; i++) {
            errMess = rules[i](inputElem.value);
            if (errMess) {
                break;
            }
        }

        if (errMess) {
            errorElem.innerText = errMess;
            inputElem.parentElement.classList.add("invalid");
        } else {
            errorElem.innerText = "";
            inputElem.parentElement.classList.remove("invalid");
        }

        return !errMess;
    };

    const formElem = document.querySelector(options.form);

    if (formElem) {
        // Xử lí submit
        formElem.onsubmit = (e) => {
            e.preventDefault();

            let isFormValid = true;

            options.rules.forEach((rule) => {
                const inputElem = formElem.querySelector(rule.selector);
                const errorElem = inputElem.parentElement.querySelector(
                    options.errorSelector
                );
                const isValid = validate(inputElem, errorElem, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            // Lấy giá trị nhập vào
            if (isFormValid) {
                // Submit với javascript
                if (typeof options.onSubmit === "function") {
                    const enableInputs = formElem.querySelectorAll(
                        "[name]:not([disabled])"
                    );
                    const formValues = Array.from(enableInputs).reduce(
                        (values, input) => {
                            return (values[input.name] = input.value) && values;
                        },
                        {}
                    );

                    options.onSubmit(formValues);
                } else {
                    // Submit với hành vi mặc định
                    formElem.submit();
                }
            }
        };

        // Lắng nghe các sự kiện khác submit
        options.rules.forEach((rule) => {
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            const inputElem = formElem.querySelector(rule.selector);
            const errorElem = inputElem.parentElement.querySelector(
                options.errorSelector
            );

            if (inputElem) {
                inputElem.onblur = () => {
                    validate(inputElem, errorElem, rule);
                };

                inputElem.oninput = () => {
                    errorElem.innerText = "";
                    inputElem.parentElement.classList.remove("invalid");
                };
            }
        });
    }
};

/**
 * Các phương thức validate input
 *
 * @param {*} selector
 * @returns mess lỗi hoặc undefined
 */
Validator.isRequired = (selector) => {
    return {
        selector: selector,
        test: (value) => {
            return value.trim() ? undefined : "Vui lòng nhập trường này";
        },
    };
};
