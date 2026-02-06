export interface VisaType {
  id: string;
  name: string;
  category: 'Employment' | 'Family' | 'Student' | 'Tourist' | 'Other';
  description: string;
  emoji: string;
  questions: Question[];
  requirements: string[];
  processingTime: string;
  fee: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'boolean' | 'choice' | 'text';
  options?: string[];
  eligibilityRule: (answer: string) => boolean;
  disqualifyingAnswer?: string;
}

export const visaTypes: VisaType[] = [
  {
    id: 'h1b',
    name: 'H-1B Specialty Occupation',
    category: 'Employment',
    description: 'For professionals in specialty occupations requiring a bachelor\'s degree or higher.',
    emoji: '💼',
    questions: [
      {
        id: 'has_job_offer',
        text: 'Do you have a job offer from a U.S. employer?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'bachelor_degree',
        text: 'Do you have a bachelor\'s degree or higher in a related field?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'specialty_occupation',
        text: 'Is your job in a specialty occupation (IT, Engineering, Finance, etc.)?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      }
    ],
    requirements: [
      'Valid passport (6+ months)',
      'Job offer letter from U.S. employer',
      'Bachelor\'s degree or higher (transcripts & diploma)',
      'Labor Condition Application (LCA) approval',
      'Form I-129 petition approval (by employer)',
      'Visa application fee ($190)',
      'Passport photos (2x2 inches)',
      'Resume/CV',
      'Employment contract'
    ],
    processingTime: '3-6 months (Premium processing 15 days)',
    fee: '$190 (Plus $2,500 for premium processing)'
  },
  {
    id: 'f1',
    name: 'F-1 Student Visa',
    category: 'Student',
    description: 'For academic students enrolled in U.S. educational institutions.',
    emoji: '🎓',
    questions: [
      {
        id: 'enrolled_school',
        text: 'Have you been accepted to a U.S. school or university?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'form_i20',
        text: 'Have you received Form I-20 from your school?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'financial_support',
        text: 'Can you prove you have funds for tuition and living expenses?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'english_proficiency',
        text: 'Do you have adequate English proficiency (or enrolled in ESL)?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      }
    ],
    requirements: [
      'Valid passport',
      'Form I-20 from SEVP-approved school',
      'SEVIS fee payment receipt ($350)',
      'Visa application fee ($160)',
      'Passport photos',
      'Financial documents (bank statements, scholarship letters)',
      'Academic transcripts and diplomas',
      'Test scores (TOEFL/IELTS, SAT/GRE if applicable)',
      'Intent to return home after studies'
    ],
    processingTime: '2-8 weeks',
    fee: '$160 + $350 SEVIS fee'
  },
  {
    id: 'b1b2',
    name: 'B-1/B-2 Visitor Visa',
    category: 'Tourist',
    description: 'For temporary business (B-1) or tourism/medical (B-2) visits.',
    emoji: '✈️',
    questions: [
      {
        id: 'visit_purpose',
        text: 'What is your purpose of visit?',
        type: 'choice',
        options: ['Business meetings', 'Tourism/Vacation', 'Medical treatment', 'Visiting family', 'Conference/Event'],
        eligibilityRule: (answer) => ['Business meetings', 'Tourism/Vacation', 'Medical treatment', 'Visiting family', 'Conference/Event'].includes(answer)
      },
      {
        id: 'temporary_visit',
        text: 'Is your visit temporary (do you intend to return home)?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'funds_available',
        text: 'Do you have funds to cover your stay in the U.S.?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'us_ties',
        text: 'Do you have strong ties to your home country (job, family, property)?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      }
    ],
    requirements: [
      'Valid passport (6+ months beyond stay)',
      'Visa application fee ($160)',
      'Passport photos (2x2 inches)',
      'Proof of purpose (invitation letter, itinerary, medical records)',
      'Financial evidence (bank statements, pay stubs)',
      'Ties to home country (employment letter, property deeds)',
      'Travel itinerary and hotel bookings'
    ],
    processingTime: '2-12 weeks (varies by country)',
    fee: '$160'
  },
  {
    id: 'green_card_family',
    name: 'Family-Based Green Card',
    category: 'Family',
    description: 'For immediate relatives of U.S. citizens or lawful permanent residents.',
    emoji: '👨‍👩‍👧‍👦',
    questions: [
      {
        id: 'family_relationship',
        text: 'What is your relationship to the U.S. citizen/LPR?',
        type: 'choice',
        options: ['Spouse', 'Parent', 'Child under 21', 'Sibling', 'Other relative'],
        eligibilityRule: (answer) => ['Spouse', 'Parent', 'Child under 21', 'Sibling'].includes(answer)
      },
      {
        id: 'petitioner_citizen',
        text: 'Is your family member a U.S. citizen?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes' || answer === 'no' // Both citizens and LPRs can petition
      },
      {
        id: 'marriage_genuine',
        text: 'If spouse, is your marriage genuine and not for immigration purposes?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      }
    ],
    requirements: [
      'Valid passport',
      'Form I-130 petition approval',
      'Form I-485 (Adjustment of Status) or DS-260 (Consular Processing)',
      'Birth certificate (translated if needed)',
      'Marriage certificate (if applicable)',
      'Divorce/death certificates (if previously married)',
      'Medical examination (Form I-693)',
      'Affidavit of Support (Form I-864)',
      'Police clearance certificates',
      'Financial documents from sponsor'
    ],
    processingTime: '10 months - 2+ years (varies by relationship)',
    fee: '$535 (I-130) + $1,140 (I-485) or $325 (DS-260)'
  },
  {
    id: 'o1',
    name: 'O-1 Extraordinary Ability',
    category: 'Employment',
    description: 'For individuals with extraordinary ability in sciences, arts, education, business, or athletics.',
    emoji: '🏆',
    questions: [
      {
        id: 'extraordinary_ability',
        text: 'Do you have extraordinary ability in your field?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'awards_recognition',
        text: 'Have you received national or international awards/recognition?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'us_work_event',
        text: 'Do you have a specific work event, project, or employer in the U.S.?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      }
    ],
    requirements: [
      'Valid passport',
      'Employment contract or itinerary',
      'Evidence of extraordinary ability (awards, publications, media coverage)',
      'Letters of recommendation from experts',
      'Membership in prestigious associations',
      'Published material about your work',
      'Original contributions to your field',
      'High remuneration evidence',
      'Visa application fee ($190)'
    ],
    processingTime: '2-6 months (Premium processing 15 days)',
    fee: '$190 + $2,500 premium processing (optional)'
  },
  {
    id: 'j1',
    name: 'J-1 Exchange Visitor',
    category: 'Other',
    description: 'For exchange visitors in approved programs (students, scholars, trainees).',
    emoji: '🌐',
    questions: [
      {
        id: 'exchange_program',
        text: 'Have you been accepted to a J-1 exchange program?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'form_ds2019',
        text: 'Have you received Form DS-2019?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'english_requirement',
        text: 'Do you meet the English language requirement?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'home_residency',
        text: 'Are you aware of the 2-year home residency requirement (for some countries)?',
        type: 'boolean',
        eligibilityRule: (answer) => true // Just needs awareness
      }
    ],
    requirements: [
      'Valid passport',
      'Form DS-2019 from program sponsor',
      'SEVIS fee payment ($220)',
      'Visa application fee ($160)',
      'Passport photos',
      'Proof of financial support',
      'English proficiency evidence',
      'Ties to home country',
      'Health insurance (required for J-1)'
    ],
    processingTime: '2-8 weeks',
    fee: '$160 + $220 SEVIS fee'
  },
  {
    id: 'l1',
    name: 'L-1 Intracompany Transferee',
    category: 'Employment',
    description: 'For employees transferring from foreign offices to U.S. offices of the same company.',
    emoji: '🏢',
    questions: [
      {
        id: 'employed_1_year',
        text: 'Have you worked for the company for at least 1 continuous year in the past 3 years?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'same_company',
        text: 'Is the U.S. office a parent, branch, affiliate, or subsidiary of the foreign company?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'managerial_role',
        text: 'Will you work in a managerial/executive role (L-1A) or specialized knowledge role (L-1B)?',
        type: 'choice',
        options: ['Managerial/Executive (L-1A)', 'Specialized Knowledge (L-1B)'],
        eligibilityRule: (answer) => ['Managerial/Executive (L-1A)', 'Specialized Knowledge (L-1B)'].includes(answer)
      }
    ],
    requirements: [
      'Valid passport',
      'Employment verification letter (foreign office)',
      'Evidence of 1-year employment',
      'U.S. company documentation',
      'Description of role in U.S.',
      'Evidence of qualifying relationship between companies',
      'Visa application fee ($190)',
      'Passport photos'
    ],
    processingTime: '1-6 months (Premium processing 15 days)',
    fee: '$190 + $2,500 premium processing (optional)'
  },
  {
    id: 'eb5',
    name: 'EB-5 Immigrant Investor',
    category: 'Other',
    description: 'For investors who invest $1.05M (or $800K in TEA) and create 10 U.S. jobs.',
    emoji: '💰',
    questions: [
      {
        id: 'investment_amount',
        text: 'Can you invest $1.05 million (or $800,000 in Targeted Employment Area)?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'legitimate_source',
        text: 'Can you prove the investment funds come from legitimate sources?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      },
      {
        id: 'job_creation',
        text: 'Will your investment create/preserve at least 10 full-time U.S. jobs?',
        type: 'boolean',
        eligibilityRule: (answer) => answer === 'yes',
        disqualifyingAnswer: 'no'
      }
    ],
    requirements: [
      'Valid passport',
      'Investment capital ($1.05M or $800K in TEA)',
      'Evidence of lawful source of funds (tax returns, business records, sale agreements)',
      'Business plan with job creation projections',
      'Regional Center documentation (if applicable)',
      'Form I-526 petition',
      'Form I-485 (if adjusting status) or DS-260 (if consular processing)',
      'Medical examination',
      'Biometrics and background check'
    ],
    processingTime: '2-5 years (varies by country of origin)',
    fee: '$3,675 (I-526) + additional fees for I-485 or DS-260'
  }
];

// Helper function to determine eligibility based on answers
export function checkEligibility(visa: VisaType, answers: Record<string, string>): {
  eligible: boolean;
  disqualifyingReasons: string[];
  missingAnswers: string[];
} {
  const disqualifyingReasons: string[] = [];
  const missingAnswers: string[] = [];
  
  for (const question of visa.questions) {
    const answer = answers[question.id];
    
    if (!answer) {
      missingAnswers.push(question.text);
      continue;
    }
    
    const isEligible = question.eligibilityRule(answer);
    
    if (!isEligible) {
      disqualifyingReasons.push(`Ineligible based on: ${question.text}`);
    }
  }
  
  return {
    eligible: disqualifyingReasons.length === 0 && missingAnswers.length === 0,
    disqualifyingReasons,
    missingAnswers
  };
}

// Get next question to ask
export function getNextQuestion(visa: VisaType, answers: Record<string, string>): Question | null {
  for (const question of visa.questions) {
    if (!answers[question.id]) {
      return question;
    }
  }
  return null;
}
