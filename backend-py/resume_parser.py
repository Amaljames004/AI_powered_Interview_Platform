# resume_parser.py - Modular Resume Parser Class
import re
import math
import json
import fitz  # PyMuPDF
from urllib.parse import urlparse, parse_qs, unquote
from rapidfuzz import process, fuzz
from typing import List, Dict, Any, Optional, Tuple

class ResumeParser:
    """
    AI-powered resume parser for SkillHire platform
    Version: 1.0.0 (Accuracy improvements in progress)
    """
    
    def __init__(self):
        self.skill_lexicon = self._load_skill_lexicon()
        self.section_words = self._load_section_words()
        self.canonical_headings = self._load_canonical_headings()
        self.degree_dict = self._load_degree_dict()
        self.cert_issuers = self._load_cert_issuers()
        
        # Regex patterns
        self.url_regex = re.compile(r"""(?xi)\b((?:https?://|www\.)[a-z0-9.-]+\.[a-z]{2,}(?:/[^\s<>()\[\]{}"]*)?)\b""")
        self.bare_linkedin = re.compile(r'\blinkedin\.com/(in|pub|company)/[A-Za-z0-9\-_%/]+\b', re.I)
        self.bare_github = re.compile(r'\bgithub\.com/[A-Za-z0-9\-_]+(?:/[A-Za-z0-9\-_]+)?\b', re.I)
        self.email_regex = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', re.I)
        self.phone_regex = re.compile(r'(\+?\d{1,3}[-\s]?)?(\(?\d{2,4}\)?[-\s]?)?\d{3,4}[-\s]?\d{4}')
        self.date_pattern = re.compile(r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}|\b(19|20)\d{2}\b", re.I)
        self.cert_hints = re.compile(r"\b(certification|certificate|certified|course|nanodegree)\b", re.I)
        self.cred_id = re.compile(r"(credential id|license|license no\.?|id)[:\s]*([A-Za-z0-9\-]+)", re.I)
        self.date_range = re.compile(r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4})\s*[-–]\s*(present|current|((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}))", re.I)
        self.role_hints = ["intern", "engineer", "developer", "analyst", "research", "associate", "manager", "lead", "consultant"]
        self.year_range = re.compile(r"(19|20)\d{2}\s*(?:[-–]\s*(19|20)\d{2})?")
        self.score = re.compile(r"(cgpa|c\.g\.p\.a|gpa|grade|percentage|%)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?(?:\s*/\s*10|/100|%)?)", re.I)
        self.project_tech_hints = re.compile(r"(tech\s*stack|tools|used|technologies)\s*[:\-]\s*(.+)", re.I)


    def parse_resume(self, pdf_path: str) -> Dict[str, Any]:
        """
        Main method to parse a PDF resume
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing structured resume data
        """
        try:
            # Extract layout and text
            lines, full_text = self._extract_layout(pdf_path)
            
            # Extract basic information
            urls, emails = self._extract_links_and_emails(pdf_path)
            link_classes = self._classify_links(urls)
            phones = self._extract_phones(full_text)
            name = self._extract_name(lines)
            
            # Detect sections
            headings = self._detect_headings(lines)
            sections = self._build_sections(lines, headings)
            
            # Parse detailed information
            skills = self._parse_skills(sections, full_text)
            certs, cert_links = self._parse_certifications(sections, urls)
            projects = self._parse_projects(sections)
            jobs = self._parse_experience(sections)
            education = self._parse_education(sections)
            
            # Compile results
            result = {
                "name": name,
                "email": emails[:3],
                "phone": phones[:2],
                "links": link_classes,
                "cert_links": cert_links,
                "skills": skills,
                "certifications": certs,
                "projects": projects,
                "experience": jobs,
                "education": education,
                "parsing_status": "success"
            }
            
            return result
            
        except Exception as e:
            return {
                "parsing_status": "error",
                "error_message": str(e),
                "name": None,
                "email": [],
                "phone": [],
                "links": {},
                "cert_links": [],
                "skills": [],
                "certifications": [],
                "projects": [],
                "experience": [],
                "education": []
            }

    def parse_resume_from_text(self, raw_text: str) -> Dict[str, Any]:
        """Parse resume content from plain text (for DOC/DOCX conversion)"""
        try:
            lines_list = [l for l in raw_text.splitlines() if l.strip()]
            lines = [{"text": l, "avg_size": 12, "has_bold": False} for l in lines_list]

            urls = set([m.group(1) for m in self.url_regex.finditer(raw_text)])
            emails = list(set(self.email_regex.findall(raw_text)))
            link_classes = self._classify_links(list(urls))
            phones = self._extract_phones(raw_text)
            name = self._extract_name(lines)

            headings = self._detect_headings(lines)
            sections = self._build_sections(lines, headings)

            skills = self._parse_skills(sections, raw_text)
            certs, cert_links = self._parse_certifications(sections, list(urls))
            projects = self._parse_projects(sections)
            jobs = self._parse_experience(sections)
            education = self._parse_education(sections)

            return {
                "name": name,
                "email": emails[:3],
                "phone": phones[:2],
                "links": link_classes,
                "cert_links": cert_links,
                "skills": skills,
                "certifications": certs,
                "projects": projects,
                "experience": jobs,
                "education": education,
                "parsing_status": "success"
            }
        except Exception as e:
            return {
                "parsing_status": "error",
                "error_message": str(e),
                "name": None,
                "email": [],
                "phone": [],
                "links": {},
                "cert_links": [],
                "skills": [],
                "certifications": [],
                "projects": [],
                "experience": [],
                "education": []
            }

    def match_skills_with_job(self, resume_skills: List[str], job_requirements: List[str]) -> Dict[str, Any]:
        """
        Match resume skills with job requirements
        
        Args:
            resume_skills: List of skills from resume
            job_requirements: List of required skills for job
            
        Returns:
            Dictionary with matching results and recommendations
        """
        matched_skills = []
        missing_skills = []
        
        # Normalize skills for comparison
        resume_skills_lower = [skill.lower().strip() for skill in resume_skills]
        job_requirements_lower = [skill.lower().strip() for skill in job_requirements]
        
        for job_skill in job_requirements_lower:
            # Exact match first
            if job_skill in resume_skills_lower:
                matched_skills.append(job_skill)
            else:
                # Fuzzy matching
                match, score, _ = process.extractOne(job_skill, resume_skills_lower, scorer=fuzz.token_set_ratio)
                if score >= 80:  # 80% similarity threshold
                    matched_skills.append(job_skill)
                else:
                    missing_skills.append(job_skill)
        
        skill_percentage = (len(matched_skills) / len(job_requirements_lower)) * 100 if job_requirements_lower else 0
        
        # Generate recommendations
        recommendations = self._generate_skill_recommendations(missing_skills)
        
        return {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_percentage": round(skill_percentage, 2),
            "recommendations": recommendations
        }
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from raw text"""
        return self._parse_skills({"skills": text}, text, threshold=75)
    
    def get_skill_lexicon(self) -> List[str]:
        """Get the current skill lexicon"""
        return self.skill_lexicon
    
    # Private methods
    def _normalize_whitespace(self, s: str) -> str:
        """Normalize whitespace in text"""
        return re.sub(r"\s+", " ", s).strip()
    
    def _title_case_name(self, s: str) -> str:
        """Convert name to title case if all uppercase"""
        if s.isupper():
            return " ".join(w.capitalize() for w in s.split())
        return s
    
    def _extract_layout(self, pdf_path: str) -> Tuple[List[Dict], str]:
        """Extract layout information from PDF"""
        doc = fitz.open(pdf_path)
        lines = []
        full = []

        for pno, page in enumerate(doc):
            data = page.get_text("dict")
            for bi, blk in enumerate(data["blocks"]):
                if blk["type"] != 0:  # text only
                    continue
                for li, line in enumerate(blk["lines"]):
                    spans = []
                    text_fragments = []
                    for si, sp in enumerate(line["spans"]):
                        txt = sp["text"]
                        if not txt.strip():
                            continue
                        spans.append({
                            "size": sp["size"],
                            "font": sp["font"],
                            "bold": bool("Bold" in sp["font"] or sp.get("flags",0) & 2),
                            "color": sp.get("color", 0),
                        })
                        text_fragments.append(txt)
                    if not text_fragments:
                        continue
                    text = self._normalize_whitespace("".join(text_fragments))
                    if not text:
                        continue
                    lines.append({
                        "page": pno,
                        "block_idx": bi,
                        "line_idx": li,
                        "text": text,
                        "spans": spans,
                        "bbox": line["bbox"],
                        "avg_size": sum(s["size"] for s in spans)/len(spans),
                        "has_bold": any(s["bold"] for s in spans)
                    })
                    full.append(text)
        doc.close()
        return lines, "\n".join(full)
    
    def _extract_links_and_emails(self, pdf_path: str) -> Tuple[List[str], List[str]]:
        """Extract URLs and email addresses from PDF"""
        urls, emails = set(), set()
        doc = fitz.open(pdf_path)
        for page in doc:
            # clickable links
            for annot in page.links():
                if annot.get('uri'):
                    urls.add(self._normalize_url(annot['uri']))
            # text scan
            txt = page.get_text()
            for m in self.url_regex.finditer(txt):
                urls.add(self._normalize_url(m.group(1)))
            for m in self.bare_linkedin.finditer(txt):
                urls.add(self._normalize_url(m.group(0)))
            for m in self.bare_github.finditer(txt):
                urls.add(self._normalize_url(m.group(0)))
            for m in self.email_regex.finditer(txt):
                emails.add(m.group(0).lower())
        doc.close()
        return sorted(urls), sorted(emails)
    
    def _normalize_url(self, u: str) -> str:
        """Normalize URL format"""
        u = u.strip().strip(').,]}>"\'')
        if u.startswith('www.'):
            u = 'https://' + u
        parsed = urlparse(u)
        # unwrap LinkedIn authwall
        if 'linkedin.com' in parsed.netloc and '/authwall' in parsed.path:
            q = parse_qs(parsed.query)
            if 'sessionRedirect' in q:
                u = unquote(q['sessionRedirect'][0])
                parsed = urlparse(u)
        # drop tracking on LinkedIn
        if 'linkedin.com' in parsed.netloc:
            u = f"{parsed.scheme or 'https'}://{parsed.netloc}{parsed.path}"
        return u
    
    def _classify_links(self, urls: List[str]) -> Dict[str, List[str]]:
        """Classify URLs into categories"""
        out = {"linkedin": [], "github_profiles": [], "github_repos": [], "portfolio": [], "other": []}
        for u in urls:
            host = urlparse(u).netloc.lower()
            path = urlparse(u).path.strip("/")
            parts = [p for p in path.split("/") if p]
            if "linkedin.com" in host:
                if parts and parts[0] in {"in","pub"}:
                    out["linkedin"].append(u)
                else:
                    out["other"].append(u)
            elif "github.com" in host:
                if len(parts) == 1:
                    out["github_profiles"].append(u)
                elif len(parts) >= 2:
                    out["github_repos"].append(u)
            elif any(k in host for k in ["notion","about.me","vercel.app","github.io","read.cv","me/","io"]):
                out["portfolio"].append(u)
            else:
                out["other"].append(u)
        # dedupe
        out["linkedin"] = sorted(set(out["linkedin"]))
        return out
    
    def _extract_phones(self, text: str) -> List[str]:
        """Extract phone numbers"""
        cands = set()
        for m in self.phone_regex.finditer(text):
            raw = re.sub(r"[^\d+]", "", m.group(0))
            if len(re.sub(r"\D", "", raw)) >= 10:
                cands.add(raw)
        # prefer Indian-style last 10 digits
        normalized = {re.sub(r"^(\+91|0)", "", p)[-10:] for p in cands}
        return sorted(normalized)
    
    def _extract_name(self, lines: List[Dict]) -> Optional[str]:
        """Extract name from resume"""
        if not lines:
            return None
        # Heuristic: top lines with biggest font & bold, not a section word
        top = sorted(lines[:min(15, len(lines))], key=lambda x: (-x["avg_size"], -int(x["has_bold"])))
        for L in top:
            t = L["text"].strip()
            if len(t.split()) <= 6 and t.lower() not in self.section_words and (t.isupper() or L["has_bold"]):
                # filter obvious non-names
                if not re.search(r'(education|skills|projects|experience|curriculum|vitae|resume)', t, re.I):
                    return self._title_case_name(t)
        # fallback: first non-empty top line
        return self._title_case_name(lines[0]["text"]) if lines else None
    
    def _detect_headings(self, lines: List[Dict]) -> List[Dict]:
        """Detect section headings in resume"""
        headings = []
        for i, L in enumerate(lines):
            t = L["text"].strip()
            head_key = self._classify_heading(t)
            if head_key:
                headings.append({"idx": i, "key": head_key, "text": t})
            else:
                # allow visual headings even if not canonical
                if (L["has_bold"] or L["avg_size"] >= (max(12, lines[0]["avg_size"]))) and len(t) <= 5*5:
                    # if it looks like a heading but unknown, keep raw
                    if re.match(r"^[A-Z][A-Z \-/&]+$", t) and t.lower() not in self.section_words:
                        headings.append({"idx": i, "key": t.lower(), "text": t})
        # dedupe by key keeping first occurrence
        seen, out = set(), []
        for h in sorted(headings, key=lambda x: x["idx"]):
            k = h["key"]
            if k not in seen:
                seen.add(k); out.append(h)
        return out
    
    def _classify_heading(self, text: str) -> Optional[str]:
        """Classify a text as a known heading type"""
        t = text.lower().strip(": ")
        for key, variants in self.canonical_headings.items():
            if any(t == v for v in variants):
                return key
        return None
    
    def _build_sections(self, lines: List[Dict], headings: List[Dict]) -> Dict[str, str]:
        """Build section mapping"""
        sections = {}
        if not headings:
            return sections
        # sort by idx
        H = sorted(headings, key=lambda x: x["idx"])
        for j, h in enumerate(H):
            start = h["idx"] + 1
            end = H[j+1]["idx"] if j+1 < len(H) else len(lines)
            chunk = " ".join(lines[k]["text"] for k in range(start, end))
            sections[h["key"]] = self._normalize_whitespace(chunk)
        return sections

    def _parse_skills(self, sections: Dict, full_text: str, threshold: int = 85) -> List[str]:
        """Parse skills from resume sections"""
        blob = sections.get("skills") or full_text
        # split on separators
        tokens = re.split(r"[,\|/•\-\n;]+", blob.lower())
        candidates = [self._normalize_whitespace(t) for t in tokens if len(t.strip()) >= 2][:200]
        matched = set()
        for cand in candidates:
            result = process.extractOne(cand, self.skill_lexicon, scorer=fuzz.token_set_ratio)
            if result and result[1] >= threshold:
                matched.add(result[0])
        
        # Add pattern-based matches
        extras = set()
        for t in candidates:
            if re.search(r"\breact(\.js|js)?\b", t): extras.add("react")
            if re.search(r"\bnode(\.js|js)?\b", t): extras.add("node.js")
            if re.search(r"\bnext(\.js|js)?\b", t): extras.add("next.js")
        
        return sorted(matched | extras)
    
    def _parse_certifications(self, sections: Dict, urls: List[str]) -> Tuple[List[Dict], List[str]]:
        """Parse certifications"""
        text = sections.get("certifications") or sections.get("courses") or ""
        items = []
        # split into bullet-like lines
        parts = re.split(r"(?:\n|•|- )+", text)
        for p in parts:
            q = self._normalize_whitespace(p)
            if len(q) < 4:
                continue
            if self.cert_hints.search(q) or any(iss in q.lower() for iss in self.cert_issuers):
                date = self.date_pattern.search(q)
                cred = self.cred_id.search(q)
                issuer = None
                for iss in self.cert_issuers:
                    if iss in q.lower():
                        issuer = iss.capitalize(); break
                items.append({
                    "title": q,
                    "issuer": issuer,
                    "date": date.group(0) if date else None,
                    "credential_id": cred.group(2) if cred else None
                })
        # link enrichment (Coursera, Credly, etc.)
        cred_links = [u for u in urls if any(k in u for k in ["coursera.org","credly.com","udemy.com","aws.training"])]
        return items, cred_links
    
    def _parse_projects(self, sections: Dict) -> List[Dict]:
        """Parse projects"""
        text = sections.get("projects") or ""
        if not text: return []
        lines = re.split(r"\n|•", text)
        entries, current = [], {"title": None, "summary": "", "tech": []}
        for line in lines:
            s = self._normalize_whitespace(line)
            if not s: continue
            # Title heuristic: ends with ":" or has Title Case and short
            if re.search(r":\s*$", s) or (len(s.split()) <= 10 and s[0].isupper() and s.lower() not in self.section_words):
                if current["title"] or current["summary"]:
                    entries.append(current); current={"title": None, "summary":"", "tech":[]}
                current["title"] = s.rstrip(":")
            else:
                current["summary"] += (" " + s)
                # tech stack after keywords
                m = self.project_tech_hints.search(s)
                if m:
                    techs = [t.strip().lower() for t in re.split(r"[,\|/]+", m.group(2))]
                    current["tech"].extend([t for t in techs if t])
        if current["title"] or current["summary"]:
            entries.append(current)
        # dedupe tech
        for e in entries:
            e["summary"] = e["summary"].strip()
            e["tech"] = sorted(set(e["tech"]))
        return entries
    
    def _parse_experience(self, sections: Dict) -> List[Dict]:
        """Parse experience"""
        text = sections.get("experience") or sections.get("work experience") or ""
        if not text: return []
        parts = re.split(r"\n|•", text)
        jobs = []
        for p in parts:
            s = self._normalize_whitespace(p)
            if not s: continue
            dr = self.date_range.search(s)
            role = next((w for w in self.role_hints if re.search(rf"\b{w}\b", s, re.I)), None)
            org = None
            m = re.search(r" at ([A-Za-z0-9 &.,\-]+)", s) or re.search(r"[,–-]\s*([A-Za-z0-9 &.,\-]+)$", s)
            if m: org = m.group(1).strip()
            if dr or role or org:
                jobs.append({
                    "text": s,
                    "role": role,
                    "org": org,
                    "date_range": dr.group(0) if dr else None
                })
        return jobs
    
    def _parse_education(self, sections: Dict) -> List[Dict]:
        """Parse education"""
        text = sections.get("education") or ""
        if not text: return []
        lines = [l.strip() for l in re.split(r"[\n•]+", text) if l.strip()]
        entries = []
        current = {"degree": None, "institution": None, "duration": None, "score": None, "raw": ""}

        def flush():
            if any(current.values()):
                entries.append({k:v for k,v in current.items()})
            current.update({"degree":None,"institution":None,"duration":None,"score":None,"raw":""})

        for line in lines:
            low = line.lower()
            # degree anchor
            deg = None
            for key, vars in self.degree_dict.items():
                if any(v in low for v in vars):
                    deg = key; break
            if deg:
                if current["degree"]: flush()
                current["degree"] = line
                current["raw"] += " " + line
                continue
            # else accumulate
            current["raw"] += " " + line
            if any(x in low for x in ["university","college","school","institute","iit","nit"]):
                current["institution"] = (current["institution"] or line)
            yr = self.year_range.search(line)
            if yr: current["duration"] = yr.group(0)
            sc = self.score.search(line)
            if sc: current["score"] = sc.group(0)
        flush()
        # clean
        for e in entries:
            e["raw"] = self._normalize_whitespace(e["raw"])
        return entries
    
    def _generate_skill_recommendations(self, missing_skills: List[str]) -> List[str]:
        """Generate learning recommendations for missing skills"""
        recommendations = []
        for skill in missing_skills[:3]:  # Top 3 recommendations
            recommendations.append(f"Consider learning {skill.title()} - it's highly valued for this role")
        return recommendations
    
    # Load configuration data
    def _load_skill_lexicon(self) -> List[str]:
        """Load skill lexicon"""
        return [
            # languages
            "python","java","c++","javascript","typescript","go","rust","sql",
            # frameworks/libs
            "react","next.js","node.js","express","django","flask","spring","pytorch","tensorflow","scikit-learn","opencv",
            # cloud/devops
            "aws","gcp","azure","docker","kubernetes","terraform","git","github","ci/cd",
            # data
            "pandas","numpy","matplotlib","plotly","spark","hadoop","airflow","dbt",
            # ml topics
            "nlp","computer vision","llm","rag","cnn","transformers","xgboost","lightgbm",
        ]
    
    def _load_section_words(self) -> set:
        """Load section identifying words"""
        return {"education","skills","projects","experience","certifications","achievements",
                "publications","profile","summary","interests","languages"}
    
    def _load_canonical_headings(self) -> Dict[str, List[str]]:
        """Load canonical section headings"""
        return {
            "education":["education","academics","academic background"],
            "skills":["skills","technical skills","skills & tools","core competencies"],
            "experience":["experience","work experience","professional experience","employment"],
            "projects":["projects","academic projects","personal projects"],
            "certifications":["certifications","certificates","courses","training"],
            "achievements":["achievements","awards","honors","accomplishments"],
            "summary":["summary","profile","about me","objective"],
            "links":["links","profiles","online presence"]
        }
    
    def _load_degree_dict(self) -> Dict[str, List[str]]:
        """Load degree patterns"""
        return {
            "btech": ["b.tech","btech","bachelor of technology","bachelor of engineering in","b.e"],
            "be": ["b.e","be","bachelor of engineering"],
            "mtech": ["m.tech","mtech","master of technology"],
            "msc": ["m.sc","msc","master of science"],
            "bsc": ["b.sc","bsc","bachelor of science"],
            "mba": ["mba","master of business administration"],
            "phd": ["phd","doctor of philosophy"],
            "12th": ["class 12","12th","higher secondary","senior secondary","hsc"],
            "10th": ["class 10","10th","secondary","matriculation","ssc"],
        }
    
    def _load_cert_issuers(self) -> List[str]:
        """Load certification issuers"""
        return ["coursera","udemy","udacity","google","microsoft","aws","oracle","cisco","ibm","meta","nptel","hackerrank"]