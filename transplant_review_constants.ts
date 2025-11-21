import type { ReviewItem } from './types';

const BASE_REVIEW_ITEM: Omit<ReviewItem, 'id' | 'title' | 'description'> = {
    status: 'Pending',
    completedBy: '',
    completionDate: '',
};

export const TRANSPLANT_REVIEW_ITEMS_TEMPLATE: ReviewItem[] = [
    { 
        id: 'case_presentation', 
        title: 'Case Presentation', 
        description: 'Present patient case to multidisciplinary team', 
        ...BASE_REVIEW_ITEM 
    },
    { 
        id: 'team_discussion', 
        title: 'Team Discussion', 
        description: 'Multidisciplinary team discussion and evaluation', 
        ...BASE_REVIEW_ITEM 
    },
    { 
        id: 'risk_review', 
        title: 'Risk Assessment Review', 
        description: 'Review of surgical and medical risks', 
        ...BASE_REVIEW_ITEM 
    },
    { 
        id: 'transplant_approval', 
        title: 'Transplant Approval', 
        description: 'Official transplant committee approval', 
        ...BASE_REVIEW_ITEM 
    },
    { 
        id: 'surgery_date', 
        title: 'Surgery Date Assignment', 
        description: 'Assignment of tentative transplant date', 
        ...BASE_REVIEW_ITEM 
    },
];
