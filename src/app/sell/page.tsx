'use client';

import React, { useState } from 'react';
import Button from '@/components/button';
import {
    FaBed,
    FaBath,
    FaRulerCombined,
    FaMoneyBillWave,
    FaHome,
    FaMapMarkerAlt,
    FaImages,
} from 'react-icons/fa';

const SellPage: React.FC = () => {
    const [formData, setFormData] = useState({
        type: 'rent',
        title: '',
        address: '',
        price: '',
        size: '',
        bed: '',
        bath: '',
        description: '',
        amenities: '',
        images: [] as File[],
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setFormData((prev) => ({ ...prev, images: files }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitted:', formData);
    };

    return (
        <section className="bg-gradient-to-b from-white to-[#D2E4FF] text-[#002353] min-h-screen py-[80px] px-6">
            <div className="max-w-5xl mx-auto flex flex-col gap-[48px]">
                {/* Header */}
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-[40px] font-bold leading-[140%]">Sell Your Property</h1>
                    <p className="text-[#5C7188] text-[16px] max-w-md mx-auto">
                        Create a stunning listing and get noticed by serious buyers.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-xl border border-[#D2E4FF] rounded-[20px] p-10 flex flex-col gap-10"
                >
                    {/* Listing Type */}
                    <SectionTitle icon={<FaHome />} title="Listing Type" />
                    <div className="flex gap-4">
                        {['rent', 'buy'].map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all duration-150 cursor-pointer ${formData.type === option
                                    ? 'bg-[#3871C1] text-white border-[#3871C1]'
                                    : 'bg-white text-[#3871C1] border-[#D2E4FF] hover:bg-[#f0f4ff]'
                                    }`}
                                onClick={() =>
                                    setFormData((prev) => ({ ...prev, type: option }))
                                }
                            >
                                {option === 'rent' ? 'For Rent' : 'For Sale'}
                            </button>
                        ))}
                    </div>

                    {/* Property Info */}
                    <SectionTitle icon={<FaMapMarkerAlt />} title="Property Information" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Title" name="title" icon={<FaHome />} placeholder="e.g. San Isidro Family Home" value={formData.title} onChange={handleInputChange} />
                        <Field label="Address" name="address" icon={<FaMapMarkerAlt />} placeholder="Full property address" value={formData.address} onChange={handleInputChange} />
                        <Field label="Price (₱)" name="price" type="number" icon={<FaMoneyBillWave />} placeholder="e.g. 3,500,000" value={formData.price} onChange={handleInputChange} />
                        <Field label="Size" name="size" icon={<FaRulerCombined />} placeholder="e.g. 5x7 m²" value={formData.size} onChange={handleInputChange} />
                        <Field label="Bedrooms" name="bed" type="number" icon={<FaBed />} placeholder="e.g. 3" value={formData.bed} onChange={handleInputChange} />
                        <Field label="Bathrooms" name="bath" type="number" icon={<FaBath />} placeholder="e.g. 2" value={formData.bath} onChange={handleInputChange} />
                    </div>

                    {/* Description */}
                    <SectionTitle icon={<FaHome />} title="Description & Amenities" />
                    <div className="flex flex-col gap-4">
                        <textarea
                            name="description"
                            rows={5}
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your property..."
                            className="w-full border border-[#D2E4FF] px-4 py-3 rounded-[12px] text-sm placeholder-[#9AA6B2] resize-none focus:ring-2 focus:ring-[#B8D6FF]"
                        />
                        <input
                            type="text"
                            name="amenities"
                            value={formData.amenities}
                            onChange={handleInputChange}
                            placeholder="e.g. Gated Community, Pet Friendly"
                            className="w-full border border-[#D2E4FF] px-4 py-3 rounded-[12px] text-sm placeholder-[#9AA6B2] focus:ring-2 focus:ring-[#B8D6FF]"
                        />
                    </div>

                    {/* Images */}
                    <SectionTitle icon={<FaImages />} title="Photos" />

                    <div className="flex flex-col gap-4">
                        {/* Dropzone-style Label */}
                        <label
                            htmlFor="image-upload"
                            className="border-2 border-dashed border-[#D2E4FF] bg-[#F9FAFF] rounded-lg py-10 px-4 flex flex-col items-center justify-center text-center text-sm text-[#5C7188] cursor-pointer hover:bg-[#EDF3FF] transition"
                        >
                            <span className="font-medium mb-1">Click to upload or drag and drop</span>
                            <span className="text-xs">PNG, JPG, or JPEG (max 10MB)</span>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {/* Preview */}
                        {formData.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {formData.images.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-[#D2E4FF] group"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                            className="object-cover w-full h-full"
                                        />

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    images: prev.images.filter((_, i) => i !== index),
                                                }))
                                            }
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white text-[#002353] text-xs font-bold shadow-sm flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition"
                                            title="Remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-2 w-full justify-center flex">
                        <Button type="submit" variant="primary">
                            Submit Property Listing
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default SellPage;

interface FieldProps {
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field: React.FC<FieldProps> = ({
    label,
    name,
    value,
    onChange,
    icon,
    placeholder,
    type = 'text',
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#001619B2]">{label}</label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border border-[#D2E4FF] px-10 py-3 rounded-[12px] text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#B8D6FF]"
            />
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8] text-[14px]">
                    {icon}
                </span>
            )}
        </div>
    </div>
);

const SectionTitle: React.FC<{ icon?: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2 text-lg font-semibold text-[#002353]">
        {icon && <span className="text-[#8091A8] text-[18px]">{icon}</span>}
        {title}
    </div>
);
