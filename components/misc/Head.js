import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

const PageHead = ({
    title,
    description,
    image,
    url,
    preloads,
}) => {
    return (
        // prettier-ignore
        <Head>
            <title key="title">{title}</title>
            <meta key="description" name="description" content={description} />
            <meta key="og-description" property="og:description" content={description} />
            <meta key="og-image" property="og:image" content={image} />
            <meta key="og-url" property="og:url" content={url} />
            <meta key="og-type" property="og:type" content="website" />
            <meta key="tw-card" name="twitter:card" content="summary_large_image" />
            <meta key="tw-creator" name="twitter:creator" content="@cwahlers" />
            <link
                // Landscape background
                key="preload-bg-landscape"
                rel="preload"
                as="image"
                type="image/jpg"
                href="/assets/images/bg-landscape.jpg"
                media="(orientation: landscape)"
            />
            <link
                // Portrait background
                key="preload-bg-portrait"
                rel="preload"
                as="image"
                type="image/jpg"
                href="/assets/images/bg-portrait.jpg"
                media="(orientation: portrait)"
            />
            {preloads.map(preload => {
                const props = {
                    rel: "preload",
                    as: "image",
                    ...preload,
                }
                return <link key={preload.href} {...props} />;
            })}
        </Head>
    );
};

PageHead.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    image: PropTypes.string,
    preloads: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired,
            crossOrigin: PropTypes.string,
        })
    ),
};

PageHead.defaultProps = {
    image: 'https://thedoor.dev/assets/images/og.jpg',
    preloads: [],
};

export default PageHead;
