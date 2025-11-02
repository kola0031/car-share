import { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "I rent cars on Turo. What exactly is 1Now — and how does \"going direct\" with private rentals actually work?",
      answer: "1Now is your all-in-one platform to run private rentals — where renters book directly from your own website, on your own domain. That means you avoid Turo's 25% fee, keep control over the renter experience, and build repeat business that's fully yours. 1Now is already helping over 95 Turo Hosts make more money and own the full customer relationship. You also get automated ID checks, rental agreements, trip insurance, and optional Turo calendar sync — so you can use both platforms side by side if you choose."
    },
    {
      question: "Do I have to be a techie? How quickly can I launch my own booking site and start renting directly — without relying on Turo?",
      answer: "Not at all. You can launch your site in under 48 hours. Just enter your vehicles, pricing, and payment info — and 1Now handles the rest. We set up your custom website, connect Stripe or Square for payments, and activate renter verification, insurance verification, rental agreements, and your fleet dashboard. Onboarding is simple, with default templates, 1-click imports, and live support. Even if you're not tech-savvy, setup is smooth and fast."
    },
    {
      question: "Can I really earn 75% more profit by skipping Turo's 25% fee?",
      answer: "Yes — and here's the math. If your daily rental rate is $75, Turo takes $18 (25%). If your profit per day is $25, avoiding that fee increases your profit by 75%. That's what 1Now helps you keep — the profit margin you've already earned. Our tools are designed to help you scale that across your entire fleet."
    },
    {
      question: "Are Turo Hosts actually making $18,000 or more a year with 1Now?",
      answer: "Yes. One of our clients made over $18,000 in direct bookings using just their 1Now website, CRM tools, and renter follow-ups. Here's how it adds up: save $25 in fees per trip × 5 cars × 12 days per month × 12 months = $18,000/year. You also get a Profit per Car Dashboard that shows revenue, ROI, and renter activity — so you can grow your income with visibility and control."
    },
    {
      question: "Will renters actually book from my site — and how do I get traffic without Turo?",
      answer: "Yes — especially renters who've already booked with you before. They know and trust you. With 1Now, you can send them a text message with a direct booking link and even include a coupon via SMS. Most Hosts rebook 20–40% of past renters. You also get built-in marketing tools: promo codes, referral links, SMS campaigns, and integrations with Google Ads — all focused on helping you convert and rebook your customers without paying platform fees again."
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

export default FAQ;

