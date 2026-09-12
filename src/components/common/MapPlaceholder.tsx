import React from 'react';
import { GoogleMapPicker, GoogleMapPickerProps } from './GoogleMapPicker';

export type MapPlaceholderProps = GoogleMapPickerProps;

/**
 * MapPlaceholder forwards directly to GoogleMapPicker
 * ensuring full backwards-compatibility with real Google Maps rendering.
 */
export const MapPlaceholder: React.FC<MapPlaceholderProps> = (props) => {
  return <GoogleMapPicker {...props} />;
};

export default MapPlaceholder;
