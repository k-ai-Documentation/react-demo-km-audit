/** @type {import('next').NextConfig} */
import path from 'path'

const nextConfig = {
    webpack(config) {
        config.module.rules.push({
            test: /\.pug$/,
            use: 'pug-loader',
        });
        return config;
    },
    sassOptions: {
        includePaths: [path.join(process.cwd(), './src/app/styles')],
    },
    transpilePackages: ['sdk-js', "kai-asset"],
};

export default nextConfig;
