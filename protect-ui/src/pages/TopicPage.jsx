import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Lock, EyeOff, Smartphone, Globe, Link } from 'lucide-react';


const IconMap = {
  link: Link,
  shield: ShieldCheck,
  globe: Globe,
  "eye-off": EyeOff,
  smartphone: Smartphone,
  lock: Lock
};

function TopicPage() {
  const { topicId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/protect/${topicId}`)
      .then(res => {
        if (!res.ok) throw new Error('Topic not found');
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => setData({ error: "Topic not found" }));
  }, [topicId]);

  if (!data) return <div className="container p-6">Loading...</div>;
  if (data.error) return <div className="container p-6 text-danger text-center mt-12 text-2xl font-bold">Topic Not Found</div>;

  const IconComponent = IconMap[data.icon] || AlertTriangle;

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-icon">
            <IconComponent size={40} className="text-primary" />
          </div>
          <h1 className="hero-title">{data.title}</h1>
          <p className="hero-desc">{data.desc}</p>
        </div>
      </section>

      <section className="container mb-12">
        <div className="card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div className="demo-header">
              <AlertTriangle size={16} className="text-danger" />
              Real World Threat
            </div>
            <p>{data.story}</p>
            
            {data.demoType === 'url-scanner' && (
              <div className="demo-area">
                <div className="demo-header">Interactive Demo: URL Expansion</div>
                <p className="text-muted mb-4">Try pasting a suspicious short link (like bit.ly/example) to see where it goes.</p>
                <div className="url-bar">
                  <Link size={16} className="text-muted" />
                  <input type="text" className="url-input" placeholder="https://bit.ly/claim-prize-now" disabled />
                  <button className="btn btn-primary" disabled>Scan Link</button>
                </div>
                <p className="text-muted text-sm text-center">In a real scenario, this would reveal the hidden long URL.</p>
              </div>
            )}
            
            {data.demoType === 'ip-demo' && (
               <div className="demo-area text-center">
                 <Globe size={40} className="text-primary mx-auto mb-4" />
                 <p className="font-bold">Your IP is visible!</p>
                 <p className="text-muted text-sm">When you visit a site, it logs: 192.168.x.x</p>
                 <p className="text-muted text-sm">With a VPN, it logs: 104.23.x.x (VPN Server)</p>
               </div>
            )}
          </div>
          
          {data.image_url && (
            <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={data.image_url} 
                alt={data.title} 
                style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
              />
            </div>
          )}
        </div>
      </section>

      <section className="container mb-12">
        <h2 className="text-center mb-8" style={{ fontSize: '2rem' }}>How to protect yourself</h2>
        <div className="steps-grid">
          {data.steps.map((step, index) => (
            <div key={index} className="card step-card">
              <div className="step-number">0{index + 1}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default TopicPage;
