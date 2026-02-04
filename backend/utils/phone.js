const normalizeEthiopiaPhone = (input) => {
    const raw = String(input || '').trim();
    if (!raw) return null;

    // Remove spaces/dashes/parentheses
    const cleaned = raw.replace(/[\s\-()]/g, '');

    // +2519xxxxxxxx
    if (cleaned.startsWith('+251')) {
        const rest = cleaned.slice(4);
        if (/^9\d{8}$/.test(rest)) return `+251${rest}`;
        return null;
    }

    // 2519xxxxxxxx
    if (cleaned.startsWith('251')) {
        const rest = cleaned.slice(3);
        if (/^9\d{8}$/.test(rest)) return `+251${rest}`;
        return null;
    }

    // 09xxxxxxxx
    if (cleaned.startsWith('0')) {
        const rest = cleaned.slice(1);
        if (/^9\d{8}$/.test(rest)) return `+251${rest}`;
        return null;
    }

    // 9xxxxxxxx
    if (/^9\d{8}$/.test(cleaned)) {
        return `+251${cleaned}`;
    }

    return null;
};

module.exports = {
    normalizeEthiopiaPhone,
};
