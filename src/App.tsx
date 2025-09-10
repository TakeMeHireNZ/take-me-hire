import React, { useEffect, useMemo, useState } from 'react'

type Candidate = {
  id: string
  name: string
  title: string
  location: string
  availability: 'Full-time' | 'Part-time' | 'Contract' | ''
  skills: string[]
  bio?: string
  verified?: boolean
}

const STORAGE_KEY = 'take-me-hire-candidates'

const seedCandidates: Candidate[] = [
  { id: 'seed-1', name: 'Sarah Thompson', title: 'Payroll Officer', location: 'Whangārei', availability: 'Full-time', skills: ['Payroll Systems','Xero','HRIS'], bio: '5+ years payroll in SMEs.', verified: true },
  { id: 'seed-2', name: 'James Walker', title: 'Payroll Specialist', location: 'Auckland', availability: 'Part-time', skills: ['MYOB','Compliance','Data Entry'], bio: 'Returning parent seeking 3 days/week.', verified: false },
  { id: 'seed-3', name: 'Emma Roberts', title: 'Payroll & HR Advisor', location: 'Whangārei', availability: 'Full-time', skills: ['Payroll Legislation','Onboarding','Recruitment'], bio: 'HR generalist with payroll focus.', verified: true }
]

function getStoredCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
function setStoredCandidates(cands: Candidate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cands))
  } catch {}
}

function useCandidateStore() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  useEffect(() => {
    const existing = getStoredCandidates()
    if (!existing || existing.length === 0) {
      setCandidates(seedCandidates)
      setStoredCandidates(seedCandidates)
    } else {
      setCandidates(existing)
    }
  }, [])
  const addCandidate = (c: Candidate) => {
    const next = [c, ...candidates]
    setCandidates(next)
    setStoredCandidates(next)
  }
  return { candidates, addCandidate }
}

function EmployerDashboard({ candidates }: { candidates: Candidate[] }) {
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState<Candidate['availability']>('')
  const [onlyVerified, setOnlyVerified] = useState(false)

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchRole = !role || c.title.toLowerCase().includes(role.toLowerCase())
      const matchLoc = !location || c.location.toLowerCase().includes(location.toLowerCase())
      const matchAvail = !availability || c.availability === availability
      const matchVerified = !onlyVerified || !!c.verified
      return matchRole && matchLoc && matchAvail && matchVerified
    })
  }, [candidates, role, location, availability, onlyVerified])

  return (
    <div className="grid">
      <div>
        <div className="card">
          <h3>Filters</h3>
          <div style={{marginTop:10}}>
            <input className="input" placeholder="Job Title (e.g. Payroll)" value={role} onChange={(e)=>setRole(e.target.value)} />
            <div style={{height:10}}/>
            <input className="input" placeholder="Location (e.g. Whangārei)" value={location} onChange={(e)=>setLocation(e.target.value)} />
            <div style={{height:10}}/>
            <select className="select" value={availability} onChange={(e)=>setAvailability(e.target.value as any)}>
              <option value="">Availability</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
            <div style={{height:10}}/>
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={onlyVerified} onChange={(e)=>setOnlyVerified(e.target.checked)} />
              <span>Only verified</span>
            </label>
            <div style={{height:10}}/>
            <button className="button outline" onClick={()=>{setRole('');setLocation('');setAvailability('');setOnlyVerified(false)}}>Reset</button>
          </div>
        </div>
      </div>

      <div style={{marginLeft:20}}>
        <h2>Matching Candidates ({filtered.length})</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
          {filtered.map(c=>(
            <div key={c.id} className="candidate-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <strong>{c.name}</strong>
                {c.verified && <span className="badge">Verified</span>}
              </div>
              <div style={{marginTop:6}}>{c.title}</div>
              <div style={{marginTop:6}}>📍 {c.location}</div>
              <div style={{marginTop:6}}>Availability: {c.availability}</div>
              {c.bio && <div style={{marginTop:8}}>{c.bio}</div>}
              <div className="skills">
                {c.skills.map((s, i)=>(<div key={i} className="skill">{s}</div>))}
              </div>
              <div style={{marginTop:10}}>
                <button className="button" onClick={()=>alert('View profile (demo)')}>View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function JobSeekerProfile({ onCreate }: { onCreate: (c: Candidate)=>void }) {
  const [form, setForm] = useState({ name:'', title:'', location:'', availability:'' as Candidate['availability'], skills:'', bio:'', verified:false })
  const change = (k:string,v:any)=>setForm({...form,[k]:v})
  const submit = ()=>{
    if(!form.name||!form.title||!form.location||!form.availability){ alert('Please fill name, role, location and availability.'); return }
    const cand: Candidate = {
      id: 'cand-'+Date.now(),
      name: form.name.trim(),
      title: form.title.trim(),
      location: form.location.trim(),
      availability: form.availability,
      skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean),
      bio: form.bio.trim(),
      verified: form.verified
    }
    onCreate(cand)
    setForm({ name:'', title:'', location:'', availability:'', skills:'', bio:'', verified:false })
    alert('Profile created and added to the employer search!')
  }
  return (
    <div className="card" style={{maxWidth:700,margin:'20px auto'}}>
      <h2>Create Your Job Seeker Profile</h2>
      <div style={{marginTop:10}}>
        <input className="input" placeholder="Full Name" value={form.name} onChange={(e)=>change('name',e.target.value)} />
        <div style={{height:8}}/>
        <input className="input" placeholder="Desired Role (e.g. Payroll Officer)" value={form.title} onChange={(e)=>change('title',e.target.value)} />
        <div style={{height:8}}/>
        <input className="input" placeholder="Location (e.g. Whangārei)" value={form.location} onChange={(e)=>change('location',e.target.value)} />
        <div style={{height:8}}/>
        <select className="select" value={form.availability} onChange={(e)=>change('availability',e.target.value as any)}>
          <option value="">Availability</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
        <div style={{height:8}}/>
        <input className="input" placeholder="Key Skills (comma separated)" value={form.skills} onChange={(e)=>change('skills',e.target.value)} />
        <div style={{height:8}}/>
        <textarea className="textarea" placeholder="Short Bio / About You" value={form.bio} onChange={(e)=>change('bio',e.target.value)} />
        <div style={{height:8}}/>
        <label style={{display:'flex',alignItems:'center',gap:8}}>
          <input type="checkbox" checked={form.verified} onChange={(e)=>change('verified', e.target.checked)} />
          Request Verification Badge
        </label>
        <div style={{height:12}}/>
        <button className="button" onClick={submit}>Save Profile</button>
      </div>
    </div>
  )
}

export default function App(){
  const { candidates, addCandidate } = useCandidateStore()
  const [view, setView] = useState<'employer'|'seeker'>('employer')
  return (
    <div className="container">
      <div className="header">
        <h1>Take Me Hire</h1>
        <div>
          <button className={view==='employer'?'button':'button outline'} onClick={()=>setView('employer')}>Employer Dashboard</button>
          <span style={{width:8,display:'inline-block'}}/>
          <button className={view==='seeker'?'button':'button outline'} onClick={()=>setView('seeker')}>Create Job Seeker Profile</button>
        </div>
      </div>

      {view==='employer' ? <EmployerDashboard candidates={candidates} /> : <JobSeekerProfile onCreate={addCandidate} />}

      <div className="footer">Demo only. Profiles are stored locally in your browser using localStorage.</div>
    </div>
  )
}
