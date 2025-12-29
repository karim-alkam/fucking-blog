const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
    underscore: "\x1b[4m",
};

module.exports = {
    info: (msg) => console.log(`${colors.cyan}ℹ ${colors.reset}${msg}`),
    success: (msg) => console.log(`${colors.green}✔ ${colors.reset}${msg}`),
    warn: (msg) => console.warn(`${colors.yellow}⚠ ${colors.reset}${msg}`),
    error: (msg) => console.error(`${colors.red}✖ ${colors.reset}${msg}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.underscore}${msg}${colors.reset}\n`),
    substep: (msg) => console.log(`${colors.gray}  → ${msg}${colors.reset}`),
    dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`),
};
