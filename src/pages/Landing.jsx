import React from 'react'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import FeaturesSection from '../components/FeatureSection'
import DonationSection from '../components/Donation'
import StatsSection from '../components/StatsSection'
import ContactSection from '../components/Contact'

export default function Landing() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <DonationSection />
      <StatsSection />
      <ContactSection />
    </>
  )
}