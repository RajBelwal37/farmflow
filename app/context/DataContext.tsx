"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Crop {
  id?: string;
  name: string;
  variety?: string;
  area: number;
  plantingDate: string;
  expectedHarvest: string;
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED' | 'FAILED';
  notes?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Inventory {
  category: string;
  current: number;
  min: number;
  max: number;
}

interface Livestock {
  type: string;
  count: number;
  status: 'HEALTHY' | 'SICK' | 'QUARANTINED' | 'PREGNANT' | 'NURSING' | 'RECOVERING';
  lastCheckup: string;
}

interface DataContextType {
  crops: Crop[];
  inventory: Inventory[];
  livestock: Livestock[];
  addCrop: (crop: Crop) => Promise<void>;
  updateCrop: (id: string, crop: Crop) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  addInventory: (item: Inventory) => void;
  updateInventory: (index: number, item: Inventory) => void;
  deleteInventory: (index: number) => void;
  addLivestock: (item: Livestock) => void;
  updateLivestock: (index: number, item: Livestock) => void;
  deleteLivestock: (index: number) => void;
}

const initialData = {
  crops: [],
  inventory: [
    { category: 'Fertilizer', current: 1200, min: 1000, max: 2000 },
    { category: 'Seeds', current: 500, min: 300, max: 1000 },
    { category: 'Feed', current: 800, min: 500, max: 1500 }
  ],
  livestock: [
    { type: 'Cattle', count: 50, status: 'HEALTHY' as const, lastCheckup: '2024-03-15' },
    { type: 'Poultry', count: 200, status: 'HEALTHY' as const, lastCheckup: '2024-03-14' }
  ]
};

const DataContext = createContext<DataContextType>({
  crops: [],
  inventory: [],
  livestock: [],
  addCrop: async () => {},
  updateCrop: async () => {},
  deleteCrop: async () => {},
  addInventory: () => {},
  updateInventory: () => {},
  deleteInventory: () => {},
  addLivestock: () => {},
  updateLivestock: () => {},
  deleteLivestock: () => {}
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [crops, setCrops] = useState<Crop[]>(initialData.crops);
  const [inventory, setInventory] = useState<Inventory[]>(initialData.inventory);
  const [livestock, setLivestock] = useState<Livestock[]>(initialData.livestock);

  // Fetch crops from API on mount
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await fetch('/api/crops');
        if (!res.ok) throw new Error('Failed to fetch crops');
        const data = await res.json();
        setCrops(data);
      } catch (error) {
        console.error('Error fetching crops:', error);
      }
    };
    fetchCrops();
  }, []);

  const addCrop = async (crop: Crop) => {
    try {
      console.log('Sending crop data to API:', crop);
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crop),
      });
      
      console.log('API Response status:', res.status);
      const responseData = await res.json();
      console.log('API Response data:', responseData);

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to add crop');
      }

      // Re-fetch all crops after adding
      console.log('Fetching updated crops list');
      const fetchRes = await fetch('/api/crops');
      if (!fetchRes.ok) {
        throw new Error('Failed to fetch updated crops');
      }
      const data = await fetchRes.json();
      console.log('Updated crops list:', data);
      setCrops(data);
    } catch (error) {
      console.error('Error in addCrop:', error);
      throw error;
    }
  };

  const updateCrop = async (id: string, crop: Crop) => {
    try {
      const res = await fetch('/api/crops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...crop }),
      });
      if (!res.ok) throw new Error('Failed to update crop');
      const updatedCrop = await res.json();
      setCrops((prev) => prev.map((c) => (c.id === id ? updatedCrop : c)));
    } catch (error) {
      console.error('Error updating crop:', error);
    }
  };

  const deleteCrop = async (id: string) => {
    try {
      const res = await fetch(`/api/crops?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete crop');
      setCrops((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting crop:', error);
    }
  };

  const addInventory = (item: Inventory) => {
    setInventory([...inventory, item]);
  };

  const updateInventory = (index: number, item: Inventory) => {
    const newInventory = [...inventory];
    newInventory[index] = item;
    setInventory(newInventory);
  };

  const deleteInventory = (index: number) => {
    setInventory(inventory.filter((_, i) => i !== index));
  };

  const addLivestock = (item: Livestock) => {
    setLivestock([...livestock, item]);
  };

  const updateLivestock = (index: number, item: Livestock) => {
    const newLivestock = [...livestock];
    newLivestock[index] = item;
    setLivestock(newLivestock);
  };

  const deleteLivestock = (index: number) => {
    setLivestock(livestock.filter((_, i) => i !== index));
  };

  return (
    <DataContext.Provider value={{
      crops,
      inventory,
      livestock,
      addCrop,
      updateCrop,
      deleteCrop,
      addInventory,
      updateInventory,
      deleteInventory,
      addLivestock,
      updateLivestock,
      deleteLivestock
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext); 