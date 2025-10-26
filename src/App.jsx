import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import './App.css'
import MapView from './components/MapView';

export default function App(){
  return (
    
     

      
        <MapView />
     
    
  );
}