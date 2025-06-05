"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Users, 
  Cloud, 
  Warehouse,
  ArrowRight,
  Droplets,
  Sprout,
  Leaf,
  Sun,
  CloudRain,
  Wind
} from 'lucide-react';

const features = [
  {
    title: "Smart Irrigation",
    description: "Optimize water usage with AI-powered irrigation scheduling",
    icon: Droplets,
    color: "text-blue-500",
    delay: 0.2,
  },
  {
    title: "Crop Management",
    description: "Track and manage your crops throughout their growth cycle",
    icon: Sprout,
    color: "text-green-500",
    delay: 0.4,
  },
  {
    title: "Weather Integration",
    description: "Real-time weather data to make informed farming decisions",
    icon: Sun,
    color: "text-yellow-500",
    delay: 0.6,
  },
  {
    title: "Sustainable Practices",
    description: "Implement eco-friendly farming techniques",
    icon: Leaf,
    color: "text-emerald-500",
    delay: 0.8,
  },
  {
    title: "Climate Monitoring",
    description: "Monitor and analyze environmental conditions",
    icon: Wind,
    color: "text-purple-500",
    delay: 1.0,
  },
  {
    title: "Precipitation Tracking",
    description: "Track rainfall patterns and plan accordingly",
    icon: CloudRain,
    color: "text-sky-500",
    delay: 1.2,
  },
];

const stats = [
  { value: "1000+", label: "Farms Managed" },
  { value: "50K+", label: "Crops Tracked" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support Available" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.h1 
            className="text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              FarmFlow
            </span>
          </motion.h1>

          <motion.p 
            className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your comprehensive farm management solution. Monitor crops, track livestock, manage
            inventory, and stay updated with weather conditions.
          </motion.p>

          <motion.div 
            className="mt-8 flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-8"
              onClick={() => router.push('/dashboard')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="text-3xl font-bold text-green-600">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative h-full p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className={`w-12 h-12 rounded-full ${feature.color} bg-opacity-20 flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 flex-grow">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Environment Section */}
      <div className="bg-gradient-to-b from-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sustainable Farming Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Make data-driven decisions to optimize your farm&apos;s performance while maintaining environmental responsibility.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Sprout, label: "Sustainable Growth" },
              { icon: Leaf, label: "Eco-Friendly" },
              { icon: Sun, label: "Energy Efficient" },
              { icon: CloudRain, label: "Water Conservation" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{item.label}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}