import { memo, useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What exactly is HostPilot and how does the full-service fleet management model work?",
      answer: "HostPilot is a complete fleet management platform that handles all operations for vehicle hosts. You register, subscribe ($150/month), and list your vehicles on our VEVS-powered host portal. Your cars are parked at secure PackMyShare facilities in Atlanta. HostPilot manages all guest bookings (via Turo, Booking.com, and other platforms), provides 24/7 customer service, coordinates maintenance, and handles logistics. You maintain ownership of your vehicles while earning passive income — we do the work, you earn the revenue."
    },
    {
      question: "What's included in the $150/month subscription fee?",
      answer: "The $150/month subscription includes VEVS system access and your host portal, PackMyShare parking ($97.85 per car per month is included), full booking management across multiple platforms, customer service and guest support, revenue distribution and tracking, maintenance coordination via partner auto shops, and multi-platform listing management. It's an all-inclusive service — you pay one monthly fee and we handle everything."
    },
    {
      question: "What is the one-time €580 integration fee for?",
      answer: "The €580 one-time fee covers system setup and onboarding. This includes VEVS portal configuration, PackMyShare facility setup and integration, account setup and platform connections, initial vehicle listing setup, and comprehensive training and documentation. This ensures a smooth, professional onboarding experience so your fleet is ready to start earning immediately."
    },
    {
      question: "Where are my vehicles stored and how do guests pick them up?",
      answer: "Your vehicles are securely parked at PackMyShare facilities in Atlanta. PackMyShare handles all vehicle storage, security, and pickup/drop-off logistics. Guests can pick up and return vehicles at these designated facilities, which are strategically located for convenience. The $97.85 per car per month parking fee is included in your HostPilot subscription."
    },
    {
      question: "Who handles maintenance and cleaning of my vehicles?",
      answer: "HostPilot coordinates all maintenance and cleaning through our partner network of auto shops. You can choose to handle maintenance directly or use HostPilot's partner services. Scheduled maintenance, inspections, and cleaning services are available as optional add-ons. We ensure your vehicles are always in excellent condition for guests."
    },
    {
      question: "How does revenue sharing work?",
      answer: "Revenue is shared transparently between HostPilot and you, the host. All bookings managed through HostPilot (whether via Turo, Booking.com, or direct channels) are tracked in real-time through your VEVS portal. You can see all revenue, bookings, and payouts in one dashboard. Revenue distribution is automated and transparent, so you always know where your money is coming from and when you'll receive it."
    },
    {
      question: "Can I still use Turo and other platforms alongside HostPilot?",
      answer: "Absolutely. HostPilot manages bookings across multiple platforms including Turo, Booking.com, and direct channels. We optimize your listings across all platforms to maximize bookings and revenue. You benefit from multi-platform exposure while HostPilot handles the complexity of managing everything in one place."
    },
    {
      question: "What makes HostPilot different from managing my fleet myself?",
      answer: "HostPilot eliminates all the operational work — you don't need to manage listings, respond to guest inquiries, coordinate pickups/drop-offs, handle customer service issues, or deal with maintenance scheduling. We're your full-service partner, so you can focus on owning vehicles and earning passive income. Our AI-powered tools and automation maximize your fleet's earning potential while you stay hands-free."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq">
      <div className="faq-container">
        <div className="section-header">
          <h2 className="section-title">FAQs</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <a href="#more-faqs" className="faq-link">MORE FAQs</a>
        </div>
      </div>
    </section>
  );
};

export default memo(FAQ);

