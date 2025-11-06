# @se-oss/debounce

[![CI](https://github.com/shahradelahi/ts-debounce/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/shahradelahi/ts-debounce/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/@se-oss/debounce.svg)](https://www.npmjs.com/package/@se-oss/debounce)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](/LICENSE)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@se-oss/debounce)
[![Install Size](https://packagephobia.com/badge?p=@se-oss/debounce)](https://packagephobia.com/result?p=@se-oss/debounce)

_@se-oss/debounce_ is a simple and powerful debounce library for both synchronous and asynchronous functions.

---

- [Installation](#-installation)
- [Usage](#-usage)
  - [Synchronous Function](#synchronous-function)
  - [Asynchronous Function](#asynchronous-function)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#license)

## 📦 Installation

```bash
npm install @se-oss/debounce
```

<details>
<summary>Install using your favorite package manager</summary>

**pnpm**

```bash
pnpm install @se-oss/debounce
```

**yarn**

```bash
yarn add @se-oss/debounce
```

</details>

## 📖 Usage

The `debounce` function works with both synchronous and asynchronous functions. It automatically detects the function type and returns a debounced version with the appropriate behavior.

### Synchronous Function

Use `debounce` for synchronous functions.

```javascript
import { debounce } from '@se-oss/debounce';

function resize() {
  console.log('height', window.innerHeight);
  console.log('width', window.innerWidth);
}

window.onresize = debounce(resize, 200);
```

### Asynchronous Function

Use `debounce` for promise-returning or `async` functions.

```javascript
import { debounce } from '@se-oss/debounce';

const expensiveCall = async (input) => {
  // simulate network request
  await new Promise((resolve) => setTimeout(resolve, 100));
  return input;
};

const debouncedFunction = debounce(expensiveCall, 200);

for (const number of [1, 2, 3]) {
  (async () => {
    console.log(await debouncedFunction(number));
  })();
}
// => 3
// => 3
// => 3
```

## 📚 Documentation

For all configuration options, please see [the API docs](https://www.jsdocs.io/package/@se-oss/debounce).

## 🤝 Contributing

Want to contribute? Awesome! To show your support is to star the project, or to raise issues on [GitHub](https://github.com/shahradelahi/ts-debounce)

Thanks again for your support, it is much appreciated! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/ts-debounce/graphs/contributors).
