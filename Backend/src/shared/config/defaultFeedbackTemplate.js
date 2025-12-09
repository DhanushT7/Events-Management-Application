const defaultFeedbackTemplate = {
  name: 'default',
  version: '2025.12.08',
  description: 'System default feedback template applied to new events',
  questions: [
    {
      questionId: 'q7',
      questionText: 'How effectively do you think the organization of this training programme facilitated a conducive learning environment and promoted active participation among participants?',
      questionType: 'rating',
      options: [],
      isRequired: true,
      order: 1,
      category: 'organization',
      minRating: 1,
      maxRating: 5,
      placeholder: '',
      helpText: '1 = Poor, 5 = Excellent'
    },
    {
      questionId: 'q8',
      questionText: 'How effectively did the resource persons communicate and engage with the participants to enhance their learning experience?',
      questionType: 'rating',
      options: [],
      isRequired: true,
      order: 2,
      category: 'presentation',
      minRating: 1,
      maxRating: 5,
      placeholder: '',
      helpText: 'Consider clarity, pacing, and interaction'
    },
    {
      questionId: 'q9',
      questionText: 'How well do you think the topics covered align with the current trends and challenges, and to what extent did they contribute to your professional development?',
      questionType: 'rating',
      options: [],
      isRequired: true,
      order: 3,
      category: 'content',
      minRating: 1,
      maxRating: 5,
      placeholder: '',
      helpText: 'Rate the relevance and depth of the topics'
    },
    {
      questionId: 'q10',
      questionText: 'How effective was the presentation style in conveying the key concepts and fostering a dynamic learning environment for the participants?',
      questionType: 'rating',
      options: [],
      isRequired: true,
      order: 4,
      category: 'presentation',
      minRating: 1,
      maxRating: 5,
      placeholder: '',
      helpText: 'Think about visuals, examples, and engagement'
    },
    {
      questionId: 'q11',
      questionText: "Please provide an overall assessment of the program's overall effectiveness",
      questionType: 'rating',
      options: [],
      isRequired: true,
      order: 5,
      category: 'overall',
      minRating: 1,
      maxRating: 5,
      placeholder: '',
      helpText: 'Your overall score for the event'
    },
    {
      questionId: 'q12',
      questionText: 'How do you think the training programme could have been more effective? (In 2 lines)',
      questionType: 'text',
      options: [],
      isRequired: true,
      order: 6,
      category: 'suggestions',
      multiline: true,
      rows: 2,
      placeholder: 'Share constructive suggestions',
      helpText: 'Mention specific improvements you would like to see'
    },
    {
      questionId: 'q13',
      questionText: 'How satisfied were you overall?',
      questionType: 'rating',
      options: [],
      isRequired: true,
      order: 7,
      category: 'overall',
      minRating: 1,
      maxRating: 5,
      placeholder: '',
      helpText: 'Overall satisfaction with the event'
    },
    {
      questionId: 'q14',
      questionText: 'Would you recommend the workshop to your colleagues or peers?',
      questionType: 'radio',
      options: ['Yes', 'No'],
      isRequired: true,
      order: 8,
      category: 'overall',
      placeholder: 'Select an option',
      helpText: 'Indicate if you would suggest this event to others'
    },
    {
      questionId: 'q15',
      questionText: 'Which topics or aspects of the sessions did you find most interesting or useful?',
      questionType: 'text',
      options: [],
      isRequired: true,
      order: 9,
      category: 'content',
      multiline: true,
      rows: 3,
      placeholder: 'Mention topics, speakers, or sessions',
      helpText: 'Name the parts that stood out to you'
    }
  ]
};

export default defaultFeedbackTemplate;
