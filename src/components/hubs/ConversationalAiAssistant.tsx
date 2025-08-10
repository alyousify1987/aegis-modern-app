import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Mic as MicIcon,
  SmartToy as SmartToyIcon,
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  Psychology as PsychologyIcon,
  TipsAndUpdates as TipsIcon
} from '@mui/icons-material';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
  suggestions?: string[];
}

interface ConversationContext {
  currentModule: string;
  activeAudit?: string;
  recentActions: string[];
  userRole: string;
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! I\'m your Aegis AI Assistant. I can help you with natural language queries about your audits, compliance data, and system navigation. What would you like to know?',
    timestamp: '2025-08-10 09:00:00',
    suggestions: [
      'Show me all open non-conformances in production',
      'Create a new audit for logistics department',
      'What are my pending tasks today?',
      'Generate a compliance trend report'
    ]
  },
  {
    id: '2',
    type: 'user',
    content: 'Show me all open non-conformances in the production department',
    timestamp: '2025-08-10 09:01:00'
  },
  {
    id: '3',
    type: 'assistant',
    content: 'I found 3 open non-conformances in the production department:\n\n1. **NCR-2025-007** - Document Control Issue\n   - Severity: Minor\n   - Opened: 2025-07-15\n   - Responsible: Quality Manager\n\n2. **NCR-2025-012** - Training Record Gap\n   - Severity: Major\n   - Opened: 2025-08-01\n   - Responsible: HR Manager\n\n3. **NCR-2025-015** - Equipment Calibration\n   - Severity: Minor\n   - Opened: 2025-08-05\n   - Responsible: Maintenance Team\n\nWould you like me to show details for any specific NCR or create a follow-up task?',
    timestamp: '2025-08-10 09:01:30',
    context: 'production-ncrs',
    suggestions: [
      'Show details for NCR-2025-012',
      'Create follow-up task for all production NCRs',
      'Show NCR trend analysis for production',
      'Export this list to Excel'
    ]
  }
];

const exampleQueries = [
  {
    category: 'Natural Language Querying',
    examples: [
      'Show me all open non-conformances in the production department',
      'What audits are scheduled for next month?',
      'List all high-priority risks in the system',
      'Find documents that expire in the next 30 days',
      'Show me customer complaints from Q2 2025'
    ]
  },
  {
    category: 'Command Execution',
    examples: [
      'Create a new audit for the logistics department',
      'Schedule a management review meeting for next Friday',
      'Generate a compliance trend report',
      'Export all audit findings to PDF',
      'Send reminder emails for overdue tasks'
    ]
  },
  {
    category: 'Context-Aware Assistance',
    examples: [
      'What should I focus on for today\'s audit?',
      'Suggest improvements for our document control process',
      'What are the common findings in ISO 22000 audits?',
      'Help me prepare for the upcoming external audit',
      'Recommend training based on recent non-conformances'
    ]
  }
];

const aiCapabilities = [
  {
    title: 'Natural Language Processing',
    description: 'Understands queries in plain English, Arabic, and French',
    icon: <PsychologyIcon />
  },
  {
    title: 'Context Awareness',
    description: 'Remembers your current task and provides relevant suggestions',
    icon: <InsightsIcon />
  },
  {
    title: 'Cross-Module Integration',
    description: 'Searches and acts across all system modules seamlessly',
    icon: <AnalyticsIcon />
  },
  {
    title: 'Intelligent Recommendations',
    description: 'Provides proactive suggestions based on your role and activities',
    icon: <TipsIcon />
  }
];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function ConversationalAiAssistant() {
  const [tabValue, setTabValue] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [context] = useState<ConversationContext>({
    currentModule: 'dashboard',
    recentActions: ['viewed dashboard', 'checked notifications'],
    userRole: 'Quality Manager'
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(currentMessage),
        timestamp: new Date().toLocaleString(),
        suggestions: generateSuggestions(currentMessage)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('audit') && lowerQuery.includes('create')) {
      return 'I can help you create a new audit. Based on your query, I\'ll set up an audit with the following preliminary details:\n\n- **Audit Type**: Internal Audit\n- **Standard**: ISO 22000:2018 (based on your organization profile)\n- **Scope**: As specified\n- **Estimated Duration**: 2-3 days\n\nWould you like me to proceed with creating this audit, or would you prefer to customize the details first?';
    }
    
    if (lowerQuery.includes('ncr') || lowerQuery.includes('non-conformance')) {
      return 'I\'ve searched the non-conformance database. Based on your query parameters, I found several relevant records. The results include details about severity, responsible parties, and current status. Would you like me to filter these results further or export them to a specific format?';
    }
    
    if (lowerQuery.includes('report') || lowerQuery.includes('analytics')) {
      return 'I can generate various types of reports for you:\n\n- Compliance trend analysis\n- Audit performance metrics\n- Risk assessment summaries\n- Management review reports\n\nWhich type of report would be most helpful for your current needs?';
    }
    
    return 'I understand your request and I\'m processing the information. Based on your current context and role as Quality Manager, I can provide detailed insights and take actions across all system modules. How would you like me to proceed with this request?';
  };

  const generateSuggestions = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('audit')) {
      return [
        'Show me the audit schedule for this month',
        'What are the common findings in recent audits?',
        'Generate audit performance metrics',
        'Create checklist for this audit type'
      ];
    }
    
    if (lowerQuery.includes('ncr') || lowerQuery.includes('non-conformance')) {
      return [
        'Show NCR trend analysis by department',
        'Create CAPA action plan',
        'Export NCR summary report',
        'Schedule follow-up tasks'
      ];
    }
    
    return [
      'Show my dashboard overview',
      'What tasks are due today?',
      'Generate compliance status report',
      'Help me with system navigation'
    ];
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setCurrentMessage('Show me all high priority risks in the system');
      }, 3000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleExampleQuery = (query: string) => {
    setCurrentMessage(query);
    setTabValue(0); // Switch to chat tab
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SmartToyIcon />
        Conversational AI Assistant
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>RFP Requirement 3.10:</strong> Interactive conversational interface acting as a smart assistant that can answer questions 
        in natural language, execute commands, and provide context-aware assistance across all system modules.
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="AI Chat Interface" />
          <Tab label="Example Queries" />
          <Tab label="Capabilities" />
          <Tab label="Voice Commands" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Paper sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
              {/* Chat Messages Area */}
              <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: 'background.default' }}>
                {messages.map((message) => (
                  <Box key={message.id} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                          color: message.type === 'user' ? 'primary.contrastText' : 'text.primary'
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                          {message.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {message.suggestions && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-start', ml: 1 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
                
                {isTyping && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>
                      <SmartToyIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        AI is thinking...
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              
              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Ask me anything about your audits, compliance, or system..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            color={isListening ? 'error' : 'default'}
                            onClick={handleVoiceInput}
                          >
                            <MicIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
                
                {isListening && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="error" />
                    <Typography variant="body2" color="error">
                      Listening... (speak now)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          <Grid xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Context Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Current Module"
                      secondary={context.currentModule}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="User Role"
                      secondary={context.userRole}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Recent Actions"
                      secondary={context.recentActions.join(', ')}
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSuggestionClick('Show my dashboard overview')}
                  >
                    Dashboard Overview
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSuggestionClick('What tasks are due today?')}
                  >
                    Today's Tasks
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSuggestionClick('Generate compliance report')}
                  >
                    Compliance Report
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSuggestionClick('Help me navigate the system')}
                  >
                    System Help
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>Example Queries & Commands</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Features:</strong> Natural language querying, command execution, and context-aware assistance. 
          Click any example to try it in the chat interface.
        </Alert>

        <Grid container spacing={3}>
          {exampleQueries.map((category, index) => (
            <Grid key={index} xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {category.category}
                  </Typography>
                  <List dense>
                    {category.examples.map((example, exampleIndex) => (
                      <ListItem key={exampleIndex} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ChatIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                              onClick={() => handleExampleQuery(example)}
                            >
                              "{example}"
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>AI Assistant Capabilities</Typography>
        
        <Grid container spacing={3}>
          {aiCapabilities.map((capability, index) => (
            <Grid key={index} xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {capability.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {capability.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {capability.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Technical Implementation
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Offline "Computer Intelligence" Mode</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Uses rule-based expert system (json-rules-engine) and on-device NLP (nlp.js) for 
                offline natural language processing and query understanding.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Online "AI-Enhanced" Mode</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Integrates with cloud-based Large Language Models (LLMs) for advanced natural language 
                understanding, context awareness, and intelligent response generation.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Cross-Module Integration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Seamlessly integrates with all system modules including Audit Management, Document Control, 
                Non-Conformance tracking, Analytics, and more through unified data access layer.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>Voice Commands & Speech Recognition</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Voice commands allow hands-free interaction with the AI assistant, perfect for auditors in the field 
          or when multitasking. Supports multiple languages including English, Arabic, and French.
        </Alert>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Voice Input Test
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <IconButton
                    size="large"
                    color={isListening ? 'error' : 'primary'}
                    onClick={handleVoiceInput}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: isListening ? 'error.light' : 'primary.light',
                      '&:hover': {
                        bgcolor: isListening ? 'error.main' : 'primary.main',
                      }
                    }}
                  >
                    <MicIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {isListening ? 'Listening...' : 'Tap to speak'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isListening ? 'Say your command now' : 'Press and speak your query'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Common Voice Commands
                </Typography>
                <List dense>
                  {[
                    'Show dashboard',
                    'Create new audit',
                    'List open NCRs',
                    'Generate report',
                    'Search documents',
                    'Check notifications',
                    'Schedule meeting',
                    'Export data'
                  ].map((command, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <MicIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`"${command}"`}
                        secondary="Try saying this command"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}
