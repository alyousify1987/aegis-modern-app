// Complete ISO 22000:2018 Audit Clauses and Questions
export interface AuditQuestion {
  id: string;
  question: string;
  clause: string;
  subClause?: string;
  conformance: 'conformant' | 'non-conformant' | 'not-applicable' | 'pending';
  evidence?: string[];
  comments?: string;
  linkedDocuments?: string[];
}

export interface AuditClause {
  id: string;
  clauseNumber: string;
  title: string;
  description: string;
  questions: AuditQuestion[];
}

export const ISO22000_CLAUSES: AuditClause[] = [
  {
    id: 'clause_4',
    clauseNumber: '4',
    title: 'Context of the Organization',
    description: 'Understanding the organization and its context, interested parties, and scope of FSMS',
    questions: [
      {
        id: 'q4_1_1',
        question: 'Has the organization determined external and internal issues relevant to its purpose and strategic direction that affect its ability to achieve the intended outcomes of its FSMS?',
        clause: '4.1',
        conformance: 'pending'
      },
      {
        id: 'q4_1_2',
        question: 'Does the organization monitor and review information about these external and internal issues?',
        clause: '4.1',
        conformance: 'pending'
      },
      {
        id: 'q4_2_1',
        question: 'Has the organization determined relevant interested parties and their requirements relevant to the FSMS?',
        clause: '4.2',
        conformance: 'pending'
      },
      {
        id: 'q4_2_2',
        question: 'Does the organization monitor and review information about these interested parties and their relevant requirements?',
        clause: '4.2',
        conformance: 'pending'
      },
      {
        id: 'q4_3_1',
        question: 'Has the organization determined the boundaries and applicability of the FSMS to establish its scope?',
        clause: '4.3',
        conformance: 'pending'
      },
      {
        id: 'q4_3_2',
        question: 'Is the scope documented and available to interested parties?',
        clause: '4.3',
        conformance: 'pending'
      },
      {
        id: 'q4_4_1',
        question: 'Has the organization established, implemented, maintained and continually improved an FSMS in accordance with ISO 22000?',
        clause: '4.4',
        conformance: 'pending'
      }
    ]
  },
  {
    id: 'clause_5',
    clauseNumber: '5',
    title: 'Leadership',
    description: 'Leadership and commitment, food safety policy, and organizational roles',
    questions: [
      {
        id: 'q5_1_1',
        question: 'Does top management demonstrate leadership and commitment with respect to the FSMS?',
        clause: '5.1',
        conformance: 'pending'
      },
      {
        id: 'q5_1_2',
        question: 'Does top management ensure the food safety policy and objectives are established and compatible with strategic direction?',
        clause: '5.1',
        conformance: 'pending'
      },
      {
        id: 'q5_1_3',
        question: 'Does top management ensure integration of FSMS requirements into business processes?',
        clause: '5.1',
        conformance: 'pending'
      },
      {
        id: 'q5_2_1',
        question: 'Has top management established, implemented and maintained a food safety policy?',
        clause: '5.2.1',
        conformance: 'pending'
      },
      {
        id: 'q5_2_2',
        question: 'Is the food safety policy appropriate to the purpose and context of the organization?',
        clause: '5.2.1',
        conformance: 'pending'
      },
      {
        id: 'q5_2_3',
        question: 'Is the food safety policy communicated, understood and applied at all levels?',
        clause: '5.2.2',
        conformance: 'pending'
      },
      {
        id: 'q5_3_1',
        question: 'Has top management appointed a food safety team leader with specific responsibilities?',
        clause: '5.3',
        conformance: 'pending'
      },
      {
        id: 'q5_3_2',
        question: 'Are roles, responsibilities and authorities for the FSMS assigned and communicated?',
        clause: '5.3',
        conformance: 'pending'
      }
    ]
  },
  {
    id: 'clause_6',
    clauseNumber: '6',
    title: 'Planning',
    description: 'Risk assessment, food safety objectives and planning to achieve them',
    questions: [
      {
        id: 'q6_1_1',
        question: 'When planning the FSMS, has the organization considered issues and requirements and determined risks and opportunities?',
        clause: '6.1',
        conformance: 'pending'
      },
      {
        id: 'q6_1_2',
        question: 'Has the organization planned actions to address these risks and opportunities?',
        clause: '6.1',
        conformance: 'pending'
      },
      {
        id: 'q6_2_1',
        question: 'Has the organization established food safety objectives at relevant functions and levels?',
        clause: '6.2.1',
        conformance: 'pending'
      },
      {
        id: 'q6_2_2',
        question: 'Are the food safety objectives consistent with the food safety policy, measurable, and taking into account applicable requirements?',
        clause: '6.2.1',
        conformance: 'pending'
      },
      {
        id: 'q6_2_3',
        question: 'When planning how to achieve food safety objectives, has the organization determined what will be done, resources required, responsibility, when completed and how results evaluated?',
        clause: '6.2.2',
        conformance: 'pending'
      }
    ]
  },
  {
    id: 'clause_7',
    clauseNumber: '7',
    title: 'Support',
    description: 'Resources, competence, awareness, communication and documented information',
    questions: [
      {
        id: 'q7_1_1',
        question: 'Has the organization determined and provided resources needed for establishment, implementation, maintenance and continual improvement of the FSMS?',
        clause: '7.1.1',
        conformance: 'pending'
      },
      {
        id: 'q7_1_2',
        question: 'Are people necessary for effective implementation of FSMS and operation and control of processes provided?',
        clause: '7.1.2',
        conformance: 'pending'
      },
      {
        id: 'q7_1_3',
        question: 'Are buildings and associated utilities appropriate for operations provided and maintained?',
        clause: '7.1.3',
        conformance: 'pending'
      },
      {
        id: 'q7_1_4',
        question: 'Is the work environment suitable for safe food production provided and maintained?',
        clause: '7.1.4',
        conformance: 'pending'
      },
      {
        id: 'q7_1_5',
        question: 'Are externally provided elements of FSMS controlled?',
        clause: '7.1.5',
        conformance: 'pending'
      },
      {
        id: 'q7_2_1',
        question: 'Are persons doing work affecting food safety performance competent on basis of education, training or experience?',
        clause: '7.2',
        conformance: 'pending'
      },
      {
        id: 'q7_2_2',
        question: 'Does the organization take actions to acquire necessary competence and evaluate effectiveness of actions taken?',
        clause: '7.2',
        conformance: 'pending'
      },
      {
        id: 'q7_3_1',
        question: 'Are persons doing work under organizational control made aware of the food safety policy and their contribution to FSMS effectiveness?',
        clause: '7.3',
        conformance: 'pending'
      },
      {
        id: 'q7_4_1',
        question: 'Has the organization determined internal and external communications relevant to the FSMS?',
        clause: '7.4',
        conformance: 'pending'
      },
      {
        id: 'q7_5_1',
        question: 'Does the FSMS include documented information required by ISO 22000 and determined by organization as necessary?',
        clause: '7.5.1',
        conformance: 'pending'
      }
    ]
  },
  {
    id: 'clause_8',
    clauseNumber: '8',
    title: 'Operation',
    description: 'Operational planning, control, prerequisite programs, hazard analysis, and HACCP plan',
    questions: [
      {
        id: 'q8_1_1',
        question: 'Does the organization plan, implement and control processes needed to meet requirements for realization of safe food?',
        clause: '8.1',
        conformance: 'pending'
      },
      {
        id: 'q8_2_1',
        question: 'Has the organization established, implemented and maintained prerequisite program(s) to assist in controlling food safety hazards?',
        clause: '8.2.1',
        conformance: 'pending'
      },
      {
        id: 'q8_2_2',
        question: 'Are prerequisite programs appropriate to the organization and its context, approved by food safety team?',
        clause: '8.2.2',
        conformance: 'pending'
      },
      {
        id: 'q8_4_1',
        question: 'Has the food safety team conducted a hazard analysis to determine which hazards need to be controlled?',
        clause: '8.4.1',
        conformance: 'pending'
      },
      {
        id: 'q8_4_2',
        question: 'Are all food safety hazards that are reasonably expected to occur identified and documented?',
        clause: '8.4.2',
        conformance: 'pending'
      },
      {
        id: 'q8_4_3',
        question: 'Has the food safety team conducted hazard assessment to determine which hazards are significant?',
        clause: '8.4.3',
        conformance: 'pending'
      },
      {
        id: 'q8_5_1',
        question: 'Has the organization established, implemented and maintained a HACCP plan?',
        clause: '8.5.1',
        conformance: 'pending'
      },
      {
        id: 'q8_5_2',
        question: 'Are critical control points (CCPs) identified for significant food safety hazards?',
        clause: '8.5.2',
        conformance: 'pending'
      },
      {
        id: 'q8_5_3',
        question: 'Are critical limits established for each CCP that clearly distinguish between acceptable and unacceptable?',
        clause: '8.5.3',
        conformance: 'pending'
      },
      {
        id: 'q8_5_4',
        question: 'Is a monitoring system established for each CCP to demonstrate CCPs are under control?',
        clause: '8.5.4',
        conformance: 'pending'
      },
      {
        id: 'q8_7_1',
        question: 'Has the organization established, implemented and maintained control of monitoring and measuring?',
        clause: '8.7',
        conformance: 'pending'
      },
      {
        id: 'q8_8_1',
        question: 'Has the organization established, implemented and maintained verification activities?',
        clause: '8.8',
        conformance: 'pending'
      },
      {
        id: 'q8_9_1',
        question: 'When monitoring indicates deviation from critical limits or operational criteria, are corrections applied?',
        clause: '8.9.1',
        conformance: 'pending'
      },
      {
        id: 'q8_9_2',
        question: 'Are corrective actions taken when deviations occur or when verification indicates nonconformity?',
        clause: '8.9.2',
        conformance: 'pending'
      }
    ]
  },
  {
    id: 'clause_9',
    clauseNumber: '9',
    title: 'Performance Evaluation',
    description: 'Monitoring, measurement, analysis, evaluation, internal audit, and management review',
    questions: [
      {
        id: 'q9_1_1',
        question: 'Has the organization determined what needs to be monitored and measured?',
        clause: '9.1.1',
        conformance: 'pending'
      },
      {
        id: 'q9_1_2',
        question: 'Are the methods for monitoring, measurement, analysis and evaluation determined?',
        clause: '9.1.1',
        conformance: 'pending'
      },
      {
        id: 'q9_1_3',
        question: 'Does the organization evaluate food safety performance and FSMS effectiveness?',
        clause: '9.1.2',
        conformance: 'pending'
      },
      {
        id: 'q9_2_1',
        question: 'Does the organization conduct internal audits at planned intervals?',
        clause: '9.2.1',
        conformance: 'pending'
      },
      {
        id: 'q9_2_2',
        question: 'Do internal audits provide information on whether FSMS conforms to requirements and is effectively implemented?',
        clause: '9.2.1',
        conformance: 'pending'
      },
      {
        id: 'q9_2_3',
        question: 'Has the organization established an audit programme including frequency, methods, responsibilities, planning requirements and reporting?',
        clause: '9.2.2',
        conformance: 'pending'
      },
      {
        id: 'q9_3_1',
        question: 'Does top management review the FSMS at planned intervals to ensure continuing suitability, adequacy, effectiveness and alignment?',
        clause: '9.3.1',
        conformance: 'pending'
      },
      {
        id: 'q9_3_2',
        question: 'Are management review inputs documented including status of actions from previous reviews, changes in external and internal issues, information on FSMS performance?',
        clause: '9.3.2',
        conformance: 'pending'
      },
      {
        id: 'q9_3_3',
        question: 'Do management review outputs include decisions and actions related to continual improvement opportunities and resource needs?',
        clause: '9.3.3',
        conformance: 'pending'
      }
    ]
  },
  {
    id: 'clause_10',
    clauseNumber: '10',
    title: 'Improvement',
    description: 'Nonconformity, corrective action, and continual improvement',
    questions: [
      {
        id: 'q10_1_1',
        question: 'Does the organization continually improve the suitability, adequacy and effectiveness of the FSMS?',
        clause: '10.1',
        conformance: 'pending'
      },
      {
        id: 'q10_2_1',
        question: 'When nonconformity occurs, does the organization react and take action to control and correct it?',
        clause: '10.2.1',
        conformance: 'pending'
      },
      {
        id: 'q10_2_2',
        question: 'Are the consequences of nonconformity dealt with and corrective actions taken?',
        clause: '10.2.1',
        conformance: 'pending'
      },
      {
        id: 'q10_2_3',
        question: 'Does the organization evaluate the need for action to eliminate causes of nonconformity?',
        clause: '10.2.2',
        conformance: 'pending'
      },
      {
        id: 'q10_2_4',
        question: 'Are corrective actions appropriate to the effects of nonconformities encountered?',
        clause: '10.2.2',
        conformance: 'pending'
      },
      {
        id: 'q10_3_1',
        question: 'Does the organization continually improve the FSMS considering analysis and evaluation results and management review outputs?',
        clause: '10.3',
        conformance: 'pending'
      }
    ]
  }
];

// Additional detailed questions for specific areas
export const HACCP_PRINCIPLES_QUESTIONS: AuditQuestion[] = [
  {
    id: 'haccp_p1_1',
    question: 'Has a comprehensive hazard analysis been conducted identifying biological, chemical and physical hazards?',
    clause: 'HACCP Principle 1',
    conformance: 'pending'
  },
  {
    id: 'haccp_p1_2',
    question: 'Are all raw materials, ingredients, packaging materials and processing steps included in hazard analysis?',
    clause: 'HACCP Principle 1',
    conformance: 'pending'
  },
  {
    id: 'haccp_p2_1',
    question: 'Are Critical Control Points (CCPs) identified for each significant hazard that requires control?',
    clause: 'HACCP Principle 2',
    conformance: 'pending'
  },
  {
    id: 'haccp_p2_2',
    question: 'Is CCP identification based on hazard analysis and decision tree methodology?',
    clause: 'HACCP Principle 2',
    conformance: 'pending'
  },
  {
    id: 'haccp_p3_1',
    question: 'Are critical limits established for each CCP that separate acceptable from unacceptable conditions?',
    clause: 'HACCP Principle 3',
    conformance: 'pending'
  },
  {
    id: 'haccp_p3_2',
    question: 'Are critical limits measurable (time, temperature, pH, water activity, etc.)?',
    clause: 'HACCP Principle 3',
    conformance: 'pending'
  },
  {
    id: 'haccp_p4_1',
    question: 'Is a monitoring system established for each CCP to track adherence to critical limits?',
    clause: 'HACCP Principle 4',
    conformance: 'pending'
  },
  {
    id: 'haccp_p4_2',
    question: 'Are monitoring procedures, frequency, and responsibility clearly defined?',
    clause: 'HACCP Principle 4',
    conformance: 'pending'
  },
  {
    id: 'haccp_p5_1',
    question: 'Are corrective actions established for when monitoring indicates deviation from critical limits?',
    clause: 'HACCP Principle 5',
    conformance: 'pending'
  },
  {
    id: 'haccp_p5_2',
    question: 'Do corrective actions address the cause of deviation and prevent recurrence?',
    clause: 'HACCP Principle 5',
    conformance: 'pending'
  },
  {
    id: 'haccp_p6_1',
    question: 'Are verification procedures established to confirm the HACCP system is working effectively?',
    clause: 'HACCP Principle 6',
    conformance: 'pending'
  },
  {
    id: 'haccp_p6_2',
    question: 'Does verification include validation of critical limits, review of monitoring and corrective action records?',
    clause: 'HACCP Principle 6',
    conformance: 'pending'
  },
  {
    id: 'haccp_p7_1',
    question: 'Are comprehensive records maintained for all aspects of HACCP implementation?',
    clause: 'HACCP Principle 7',
    conformance: 'pending'
  },
  {
    id: 'haccp_p7_2',
    question: 'Do records demonstrate effective operation of CCPs and corrective actions taken?',
    clause: 'HACCP Principle 7',
    conformance: 'pending'
  }
];

export const PRP_QUESTIONS: AuditQuestion[] = [
  {
    id: 'prp_1',
    question: 'Are building construction and layout designed to facilitate hygienic operations?',
    clause: 'PRP - Infrastructure',
    conformance: 'pending'
  },
  {
    id: 'prp_2',
    question: 'Are equipment and utensils designed for easy cleaning and maintenance?',
    clause: 'PRP - Equipment',
    conformance: 'pending'
  },
  {
    id: 'prp_3',
    question: 'Are cleaning and sanitizing procedures established and followed?',
    clause: 'PRP - Cleaning',
    conformance: 'pending'
  },
  {
    id: 'prp_4',
    question: 'Are pest control measures implemented and monitored?',
    clause: 'PRP - Pest Control',
    conformance: 'pending'
  },
  {
    id: 'prp_5',
    question: 'Are personal hygiene requirements established and followed by all personnel?',
    clause: 'PRP - Personal Hygiene',
    conformance: 'pending'
  },
  {
    id: 'prp_6',
    question: 'Are supplier approval and incoming material control procedures implemented?',
    clause: 'PRP - Supplier Control',
    conformance: 'pending'
  },
  {
    id: 'prp_7',
    question: 'Are storage, transportation and handling procedures adequate to prevent contamination?',
    clause: 'PRP - Storage & Transportation',
    conformance: 'pending'
  },
  {
    id: 'prp_8',
    question: 'Are waste management procedures implemented to prevent contamination?',
    clause: 'PRP - Waste Management',
    conformance: 'pending'
  },
  {
    id: 'prp_9',
    question: 'Are water, air and energy systems controlled to prevent contamination?',
    clause: 'PRP - Utilities',
    conformance: 'pending'
  },
  {
    id: 'prp_10',
    question: 'Are chemical control procedures implemented for cleaning chemicals and lubricants?',
    clause: 'PRP - Chemical Control',
    conformance: 'pending'
  }
];

// Function to get all questions for a complete audit
export function getAllAuditQuestions(): AuditQuestion[] {
  const allQuestions: AuditQuestion[] = [];
  
  // Add all clause questions
  ISO22000_CLAUSES.forEach(clause => {
    allQuestions.push(...clause.questions);
  });
  
  // Add HACCP principles questions
  allQuestions.push(...HACCP_PRINCIPLES_QUESTIONS);
  
  // Add PRP questions
  allQuestions.push(...PRP_QUESTIONS);
  
  return allQuestions;
}

// Function to get questions by clause
export function getQuestionsByClause(clauseNumber: string): AuditQuestion[] {
  const clause = ISO22000_CLAUSES.find(c => c.clauseNumber === clauseNumber);
  return clause ? clause.questions : [];
}

// Function to generate audit report
export function generateAuditSummary(questions: AuditQuestion[]) {
  const total = questions.length;
  const conformant = questions.filter(q => q.conformance === 'conformant').length;
  const nonConformant = questions.filter(q => q.conformance === 'non-conformant').length;
  const notApplicable = questions.filter(q => q.conformance === 'not-applicable').length;
  const pending = questions.filter(q => q.conformance === 'pending').length;
  
  const complianceScore = total > 0 ? Math.round((conformant / (total - notApplicable)) * 100) : 0;
  
  return {
    total,
    conformant,
    nonConformant,
    notApplicable,
    pending,
    complianceScore,
    completed: total - pending
  };
}
