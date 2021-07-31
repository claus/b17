export const pageview = url => {
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
        page_path: url,
    });
};

export const event = (category, action, label) => {
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
    });
};
