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

    const [checklist, setChecklist] = useState({
        titleDeed: false,
        deedOfSale: false,
        taxDec: false,
        taxReceipts: false,
        encumbranceCert: false,
        birCar: false,
        transferTaxClearance: false,
    });


    const [formData, setFormData] = useState({
        type: 'rent',
        title: '',
        address: '',
        price: '',
        frequency: 'monthly',
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
                <div className="text-center flex flex-col gap-2 animate-fadeIn">
                    <h1 className="text-[40px] font-bold leading-[140%]">Sell Your Property</h1>
                    <p className="text-[#5C7188] text-[16px] max-w-md mx-auto">
                        Create a stunning listing and get noticed by serious buyers.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-10 animate-fadeIn"
                >
                    {/* Listing Type */}
                    <div className='items-center flex flex-col w-full'>
                        <div className='bg-white border border-[#E3ECF9] rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow duration-200'>
                            <div className="relative flex gap-[10px] w-fit">
                                {['rent', 'buy'].map((option) => (
                                    <Button
                                        key={option}
                                        type="button"
                                        variant={formData.type === option ? 'primary' : 'secondary'}
                                        onClick={() =>
                                            setFormData((prev) => ({ ...prev, type: option }))
                                        }
                                    >
                                        {option === 'rent' ? 'For Rent' : 'For Sale'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Property Info */}
                    <Card>
                        <SectionTitle icon={<FaMapMarkerAlt />} title="Property Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Title" name="title" icon={<FaHome />} placeholder="e.g. San Isidro Family Home" value={formData.title} onChange={handleInputChange} />
                            <Field label="Address" name="address" icon={<FaMapMarkerAlt />} placeholder="Full property address" value={formData.address} onChange={handleInputChange} />
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-[#001619B2]">Price</label>
                                <div className="flex gap-2">
                                    {/* Price input */}
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder={formData.type === 'rent' ? 'e.g. 15000' : 'e.g. 3,500,000'}
                                            className="w-full border border-[#D2E4FF] px-10 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8] text-[16px]">
                                            ₱
                                        </span>
                                    </div>
                                    {/* Frequency dropdown (only if rent) */}
                                    {formData.type === 'rent' && (
                                        <>
                                            <div className='items-center flex text-[#9AA6B2]'>{"/"}</div>
                                            <select
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, frequency: e.target.value }))
                                                }
                                                className="font-medium min-w-[120px] text-[#9AA6B2] border border-[#D2E4FF] rounded-xl text-sm px-2 py-3 text-[#002353] focus:ring-2 focus:ring-[#3871C1] focus:outline-none transition"
                                            >
                                                <option value="monthly">month</option>
                                                <option value="biweekly">bi-weekly</option>
                                                <option value="weekly">week</option>
                                                <option value="daily">day</option>
                                            </select>
                                        </>

                                    )}
                                </div>
                            </div>
                            <Field label="Size" name="size" icon={<FaRulerCombined />} placeholder="e.g. 5x7 m²" value={formData.size} onChange={handleInputChange} />
                            <Field label="Bedrooms" name="bed" type="number" icon={<FaBed />} placeholder="e.g. 3" value={formData.bed} onChange={handleInputChange} />
                            <Field label="Bathrooms" name="bath" type="number" icon={<FaBath />} placeholder="e.g. 2" value={formData.bath} onChange={handleInputChange} />
                        </div>
                    </Card>

                    {/* Description */}
                    <Card>
                        <SectionTitle icon={<FaHome />} title="Description & Amenities" />
                        <div className="flex flex-col gap-4">
                            <textarea
                                name="description"
                                rows={5}
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your property..."
                                className="w-full px-4 py-3 border border-[#D2E4FF] rounded-[12px] text-sm placeholder-[#9AA6B2] focus:ring-2 focus:ring-[#3871C1] focus:outline-none transition"
                            />
                            <input
                                type="text"
                                name="amenities"
                                value={formData.amenities}
                                onChange={handleInputChange}
                                placeholder="e.g. Gated Community, Pet Friendly"
                                className="w-full px-4 py-3 border border-[#D2E4FF] rounded-[12px] text-sm placeholder-[#9AA6B2] focus:ring-2 focus:ring-[#3871C1] focus:outline-none transition"
                            />
                        </div>
                    </Card>

                    {/* Images */}
                    <Card>
                        <SectionTitle icon={<FaImages />} title="Photos" />
                        <div className="flex flex-col gap-4">
                            <label
                                htmlFor="image-upload"
                                className="border-2 border-dashed border-[#D2E4FF] bg-[#F9FAFF] rounded-xl py-10 px-6 flex flex-col items-center justify-center text-center text-sm text-[#5C7188] cursor-pointer hover:bg-[#EDF3FF] transition-all duration-150 group"
                            >
                                <FaImages className="text-2xl mb-2 text-[#3871C1] group-hover:scale-110 transition" />
                                <span className="font-medium mb-1">Drag & Drop or Click to Upload</span>
                                <span className="text-xs text-[#8CA1C6]">Max 10MB • JPG/PNG</span>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

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
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                            />
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
                    </Card>

                    <Card>
                        <SectionTitle icon={<FaImages />} title="Essential Property Documents Checklist" />
                        <ul className="flex flex-col gap-3 mt-4">
                            {[
                                {
                                    id: 'titleDeed',
                                    label: 'Title Deed / Certificate of Title (TCT or CCT)',
                                    required: false,
                                    description: 'Proves legal ownership of the property.',
                                },
                                {
                                    id: 'deedOfSale',
                                    label: 'Deed of Absolute Sale (DOAS)',
                                    required: false,
                                    description: 'Indicates the transfer agreement between seller and buyer.',
                                },
                                {
                                    id: 'taxDec',
                                    label: 'Tax Declaration',
                                    required: false,
                                    description: 'Shows the assessed property value for tax purposes.',
                                },
                                {
                                    id: 'taxReceipts',
                                    label: 'Latest Property Tax Receipts',
                                    required: false,
                                    description: 'Verifies payment of real property taxes.',
                                },
                                {
                                    id: 'encumbranceCert',
                                    label: 'Encumbrance Certificate',
                                    required: false,
                                    description: 'Confirms the property has no existing liens or mortgages.',
                                },
                                {
                                    id: 'birCar',
                                    label: 'BIR Certificate Authorizing Registration (CAR)',
                                    required: false,
                                    description: 'Issued by BIR to allow transfer of property title.',
                                },
                                {
                                    id: 'transferTaxClearance',
                                    label: 'Transfer Tax Clearance from LGU',
                                    required: false,
                                    description: 'Certifies payment of transfer tax to the local government.',
                                },
                            ].map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() =>
                                        setChecklist((prev) => ({
                                            ...prev,
                                            [item.id]: !prev[item.id as keyof typeof checklist],
                                        }))
                                    }
                                    className="flex flex-col gap-1 border border-[#D2E4FF] rounded-xl px-4 py-3 bg-[#F9FAFF] hover:bg-[#EDF3FF] transition cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={checklist[item.id as keyof typeof checklist]}
                                                onChange={() => { }}
                                                className="w-4 h-4 text-[#3871C1] accent-[#3871C1] cursor-pointer"
                                            />
                                            <span className="font-medium text-[#002353]">{item.label}</span>
                                        </div>
                                        {item.required && (
                                            <span className="text-xs text-[#8091A8] whitespace-nowrap">(Required)</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#8091A8] pl-7">{item.description}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Sticky Submit CTA */}
                    <div className="sticky bottom-0 left-0 w-full py-6 z-10 flex justify-center">
                        <Button type="submit" variant="property">
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
    <div className="flex flex-col gap-1 group">
        <label className="text-sm font-medium text-[#001619B2]">{label}</label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border border-[#D2E4FF] px-10 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
            />
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8] text-[16px] group-focus-within:scale-110 transition-transform">
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

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white border border-[#E3ECF9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        {children}
    </div>
);
