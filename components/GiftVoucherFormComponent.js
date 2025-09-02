import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
const PhoneInput = dynamic(() => import('react-phone-input-2'));
import dynamic from 'next/dynamic';
import Styles from '../styles/giftVoucher.module.scss';
import 'react-phone-input-2/lib/style.css';

const formatVoucherValue = (voucherValue, valueToExtract) => voucherValue?.split(':')[valueToExtract];

const GiftVoucherFormComponent = ({ blok }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(false);
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    blok.voucher_count.split(',').map((value, index) => index === 0 && setPlaceholder(value));
  }, [blok.voucher_count]);

  const voucherValues = blok.value_voucher.split(',');

  const createCompanyName = (sbData, userData) => {
    const sbCompanyName = sbData.company_name?.toLowerCase().trim();

    if (sbCompanyName === 'firmen name' || sbCompanyName === 'company name') {
      return userData.COMPANY_NAME;
    }
    return sbData.url_company_name;
  };

  const onSubmit = (data) => {
    if (data.VOUCHER_VALUE === placeholder) setSelectedValue(true);
    if (data.VOCHER_QUANTITY) {
      if (data.VOCHER_QUANTITY === placeholder) setSelectedQuantity(true);
    }
    if (
      data.VOUCHER_VALUE !== placeholder &&
      (data.VOCHER_QUANTITY !== placeholder || data.VOCHER_QUANTITY === undefined)
    ) {
      data.VOUCHER_VALUE = formatVoucherValue(data.VOUCHER_VALUE, 0) || data.VOUCHER_VALUE;
      data.COMPANY_NAME = createCompanyName(blok, data);
      let URLparamsFromFormData = Object.entries(data)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');
      reset();
      window.location.href = `${process.env.MATCHSPACE_GIFT}?${URLparamsFromFormData}`;
    }
  };

  const renderPhone = ({ field: { ref, ...field } }) => (
    <PhoneInput
      {...field}
      country={'ch'}
      inputExtraProps={{
        ref,
        required: true,
      }}
    />
  );

  return (
    <div className='px-4 sign-up-form'>
      <form
        className='my-8'
        name='signup'
        method='post'
        netlify
        netlify-honeypot='bot-field'
        data-netlify='true'
        onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col px-4 pb-4 text-16px'>
          <input
            name='FIRSTNAME'
            {...register('FIRSTNAME', { required: true })}
            className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable'
            placeholder={blok.fname}
            inputMode='search'
            type='text'
          />
          <p className='ml-3 text-14px text-red'>
            {errors['FIRSTNAME']?.type === 'required' && `${blok.validate_fname}`}
          </p>
        </div>
        <div className='flex flex-col px-4 pb-4 text-16px'>
          <input
            name='LASTNAME'
            {...register('LASTNAME', { required: true })}
            className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable'
            placeholder={blok.lname}
            inputMode='search'
            type='text'
          />
          <p className='ml-3 text-14px text-red'>
            {errors['LASTNAME']?.type === 'required' && `${blok.validate_lname}`}
          </p>
        </div>
        <div className={`${Styles['react-tel-input']} flex flex-col text-16px px-4 pb-4`}>
          <Controller control={control} name='SMS' render={renderPhone} rules={{ required: true }} />
          <p className='ml-3 text-14px text-red'>{errors['SMS']?.type === 'required' && `${blok.validate_phone}`}</p>
        </div>
        {!blok.general && !blok.voucher_musik_hug && (
          <div className='flex flex-col px-4 pb-4 text-16px'>
            <input
              name='COMPANY_NAME'
              {...register('COMPANY_NAME', { required: true })}
              className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable'
              placeholder={blok.company_name}
              inputMode='search'
              type='text'
            />
            <p className='ml-3 text-14px text-red'>
              {errors['COMPANY_NAME']?.type === 'required' && `${blok.validate_company}`}
            </p>
          </div>
        )}
        <div className='flex flex-col px-4 pb-4 text-16px'>
          <input
            name='email'
            {...register('email', {
              required: `${blok.validate_email}`,
              pattern: {
                message: `${blok.validate_email_message}`,
                value: /\S+@\S+\.\S+/,
              },
            })}
            type='email'
            className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable border-grey-blue'
            placeholder={
              router.asPath.includes('customers') || router.asPath.includes('unsere-kunden')
                ? blok.company_email
                : blok.email
            }
            inputMode='search'
          />
          <p className='ml-3 text-14px text-red'>{errors.email && <span role='alert'>{errors.email.message}</span>}</p>
        </div>
        <div className='flex flex-col px-4 pb-4 text-16px'>
          <input
            name='STREET_NAME_AND_NUMBER'
            {...register('STREET_NAME_AND_NUMBER', { required: true })}
            className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable border-grey-blue'
            placeholder={blok.street}
            inputMode='search'
            type='text'
          />
          <p className='ml-3 text-14px text-red'>
            {errors.STREET_NAME_AND_NUMBER?.type === 'required' && `${blok.validate_street}`}
          </p>
        </div>
        <div className='flex flex-col px-4 pb-4 text-16px'>
          <input
            name='POSTAL_CODE'
            {...register('POSTAL_CODE', { required: true })}
            className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable'
            placeholder={blok.postal_code}
            inputMode='search'
            type='text'
          />
          <p className='ml-3 text-14px text-red'>
            {errors['POSTAL_CODE']?.type === 'required' && `${blok.validate_postal}`}
          </p>
        </div>
        {!blok.voucher_musik_hug && (
          <div className='flex flex-col px-4 pb-4 text-16px'>
            <input
              name='CITY'
              {...register('CITY', { required: true })}
              className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable border-grey-blue'
              placeholder={blok.city}
              inputMode='search'
              type='text'
            />
            <p className='ml-3 text-14px text-red'>{errors.CITY?.type === 'required' && `${blok.validate_city}`}</p>
          </div>
        )}
        {blok.voucher_musik_hug && (
          <div className='flex flex-col px-4 pb-4 text-16px'>
            <input
              name='PLACE'
              {...register('PLACE', { required: true })}
              className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable border-grey-blue'
              placeholder={blok.place}
              inputMode='search'
              type='text'
            />
            <p className='ml-3 text-14px text-red'>{errors.PLACE?.type === 'required' && `${blok.validate_city}`}</p>
          </div>
        )}
        {!blok.voucher_musik_hug && (
          <div className='flex flex-col px-4 pb-4 text-16px'>
            <input
              name='NAME_AUF_GUTSCHEIN'
              {...register('NAME_AUF_GUTSCHEIN', { required: true })}
              className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable border-grey-blue'
              placeholder={blok.name_on_voucher}
              inputMode='search'
              type='text'
            />
            <p className='ml-3 text-14px text-red'>
              {errors['NAME_AUF_GUTSCHEIN']?.type === 'required' && `${blok.validate_name_on_voucher}`}
            </p>
          </div>
        )}
        {voucherValues.length === 1 ? (
          <>
            <div className='flex flex-col px-4 pb-4 text-16px'>
              <input
                readOnly
                name='VISIBLE_VOUCHER_VALUE'
                className='w-full p-2 pl-3 border rounded-lg focus:outline-none border-disable border-grey-blue'
                inputMode='search'
                value={formatVoucherValue(voucherValues[0], 1)}
                type='text'
              />
            </div>
            <div>
              <input
                type='hidden'
                name='VOUCHER_VALUE'
                {...register('VOUCHER_VALUE', { required: true })}
                value={formatVoucherValue(voucherValues[0], 0)}
              />
            </div>
          </>
        ) : (
          <div className='flex flex-col px-4 pb-4 text-16px'>
            <p className='mb-2'>{blok.value_voucher_name}</p>
            <select
              name='VOUCHER_VALUE'
              onClick={() => setSelectedValue(false)}
              className='focus:outline-none border border-disable rounded-lg border-grey-blue p-2.5 w-full'
              {...register('VOUCHER_VALUE', { required: true })}>
              {voucherValues.map((value, index) => {
                const firstItem = index === 0;
                return (
                  <option
                    disabled={firstItem && 'disabled'}
                    selected={firstItem && 'selected'}
                    value={value}
                    key={index}>
                    {firstItem ? value : formatVoucherValue(value, 1)}
                  </option>
                );
              })}
            </select>
            <p className='ml-3 text-14px text-red'>{selectedValue && `${blok.validate_voucher_value}`}</p>
          </div>
        )}
        {blok.general && (
          <div className='flex flex-col px-4 pb-4 text-16px'>
            <p className='mb-2'>{blok.number_of_voucher}</p>
            <select
              name='VOCHER_QUANTITY'
              onClick={() => setSelectedQuantity(false)}
              className='focus:outline-none border border-disable rounded-lg border-grey-blue p-2.5 w-full'
              {...register('VOCHER_QUANTITY', { required: true })}>
              {blok.voucher_count.split(',').map((value, index) => (
                <option
                  disabled={index === 0 && 'disabled'}
                  selected={index === 0 && 'selected'}
                  value={value}
                  key={index}>
                  {value}
                </option>
              ))}
            </select>
            <p className='ml-3 text-14px text-red'>{selectedQuantity && `${blok.validate_voucher_quantity}`}</p>
          </div>
        )}
        <div className='flex my-4 lg:mb-8'>
          <button
            type='submit'
            className='w-full py-3 mx-4 font-medium text-white rounded-full bg-primary px-11 text-16px hover:bg-dark-primary'>
            {blok.button}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GiftVoucherFormComponent;
