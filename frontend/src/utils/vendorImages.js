import haileResortBanner from '../Assets/Haile.jpeg';

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const isHaileResort = (vendor) => {
    const name = normalizeName(vendor?.businessName);
    return name.includes('haile resort');
};

export const resolveVendorBannerUrl = (vendor, fallbackImage) => {
    if (vendor?.bannerUrl) return vendor.bannerUrl;
    if (isHaileResort(vendor)) return haileResortBanner;
    return fallbackImage;
};
