const securityHeaders = [
    {
        key: 'strict-transport-security',
        value: 'max-age=31536000; includeSubDomains',
    },
    {
        key: 'x-frame-options',
        value: 'SAMEORIGIN',
    },
    {
        key: 'x-content-type-options',
        value: 'nosniff',
    },
    {
        key: 'referrer-policy',
        value: 'no-referrer, strict-origin-when-cross-origin',
    },
    {
        key: 'x-xss-protection',
        value: '1; mode=block',
    },
];

module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
};
