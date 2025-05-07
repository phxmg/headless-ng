import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';

const SidebarContainer = styled.div`
  width: 280px;
  background-color: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  font-weight: ${props => props.theme.fontWeights.semiBold};
  font-size: ${props => props.theme.fontSizes.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.sm} 0;
`;

const SequenceList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const SequenceItem = styled.li`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  border-left: 3px solid ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  background-color: ${props => props.isActive ? props.theme.colors.highlight : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.highlight : props.theme.colors.divider};
  }
`;

const SequenceIcon = styled.span`
  margin-right: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const SequenceTitle = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SequenceControls = styled.div`
  display: flex;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.normal};
  
  ${SequenceItem}:hover & {
    opacity: 1;
  }
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const ActionList = styled.ul`
  list-style-type: none;
  padding: 0 0 0 ${props => props.theme.spacing.xl};
  margin: 0;
`;

const ActionItem = styled.li`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: -${props => props.theme.spacing.md};
    top: 50%;
    width: ${props => props.theme.spacing.md};
    height: 1px;
    background-color: ${props => props.theme.colors.border};
  }
`;

const ActionIcon = styled.span`
  margin-right: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.xs};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  
  p {
    margin: ${props => props.theme.spacing.md} 0;
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.normal};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const SidebarFooter = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const FooterButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Sidebar = ({ setPlaybackProgress }) => {
  const dispatch = useDispatch();
  const currentSequence = useSelector(state => state.recorder.currentSequence);
  const recordedActions = useSelector(state => state.recorder.recordedActions);
  
  // Headless mode toggle
  const [headless, setHeadless] = useState(true);
  // Playback state for each sequence
  const [playbackStates, setPlaybackStates] = useState({}); // { [sequenceId]: { status, player, error, progress } }
  
  // Sample sequences for demo
  const [sequences, setSequences] = useState([
    { id: 1, title: 'Login to Example.com', actions: [
      { type: 'navigate', value: 'https://example.com' },
      { type: 'click', selector: '#username', description: 'Click username field' },
      { type: 'type', value: 'testuser', description: 'Type username' },
      { type: 'click', selector: '#password', description: 'Click password field' },
      { type: 'type', value: '********', description: 'Type password' },
      { type: 'click', selector: '#login-button', description: 'Click login button' },
      { type: 'wait', value: 2000, description: 'Wait for 2 seconds' },
      { type: 'screenshot', description: 'Take screenshot' }
    ]},
    { id: 2, title: 'Search on Google', actions: [
      { type: 'navigate', value: 'https://google.com' },
      { type: 'click', selector: 'input[name="q"]', description: 'Click search field' },
      { type: 'type', value: 'headless browser automation', description: 'Type search query' },
      { type: 'click', selector: 'input[name="btnK"]', description: 'Click search button' },
      { type: 'wait', value: 1000, description: 'Wait for 1 second' },
      { type: 'screenshot', description: 'Take screenshot of results' }
    ]}
  ]);
  
  const [activeSequence, setActiveSequence] = useState(null);
  const [expandedSequence, setExpandedSequence] = useState(null);
  
  const handleSequenceClick = (id) => {
    setActiveSequence(id);
    const sequence = sequences.find(seq => seq.id === id);
    
    if (sequence) {
      dispatch({ type: 'SET_SEQUENCE', payload: sequence });
    }
  };
  
  const handleExpandClick = (id) => {
    setExpandedSequence(expandedSequence === id ? null : id);
  };
  
  const handleAddSequence = () => {
    const newSequence = {
      id: sequences.length + 1,
      title: `New Sequence ${sequences.length + 1}`,
      actions: []
    };
    
    setSequences([...sequences, newSequence]);
  };
  
  const handlePlaySequence = (id) => {
    const sequence = sequences.find(seq => seq.id === id);
    if (sequence) {
      dispatch({ 
        type: 'START_PLAYBACK',
        payload: { totalSteps: sequence.actions.length }
      });
      // --- Playback integration ---
      const automationService = new BrowserAutomationService(headless);
      const player = new SequencePlayer(
        automationService,
        sequence.actions,
        (status, message, currentIndex, progress) => {
          setPlaybackStates(prev => ({
            ...prev,
            [id]: { ...prev[id], status, error: status === 'error' ? message : null, progress, player }
          }));
          if (typeof setPlaybackProgress === 'function') {
            setPlaybackProgress(progress);
          }
        }
      );
      setPlaybackStates(prev => ({ ...prev, [id]: { status: 'playing', player, error: null, progress: null } }));
      player.play();
      // --- End integration ---
      console.log('Playing sequence:', sequence);
    }
  };
  
  const handlePauseSequence = (id) => {
    const state = playbackStates[id];
    if (state && state.player) {
      state.player.pause();
    }
  };

  const handleResumeSequence = (id) => {
    const state = playbackStates[id];
    if (state && state.player) {
      state.player.resume();
    }
  };

  const handleStopSequence = (id) => {
    const state = playbackStates[id];
    if (state && state.player) {
      state.player.stop();
      setPlaybackStates(prev => ({ ...prev, [id]: { ...prev[id], status: 'stopped' } }));
    }
  };

  const handleRetrySequence = (id) => {
    // Re-run from the beginning
    setPlaybackStates(prev => ({ ...prev, [id]: undefined }));
    handlePlaySequence(id);
  };

  const handleSkipSequence = (id) => {
    // Move to next action (if possible)
    const state = playbackStates[id];
    if (state && state.player) {
      state.player.currentActionIndex++;
      state.player.play();
    }
  };
  
  const handleDeleteSequence = (id) => {
    const newSequences = sequences.filter(seq => seq.id !== id);
    setSequences(newSequences);
    
    if (activeSequence === id) {
      setActiveSequence(null);
      dispatch({ type: 'CLEAR_SEQUENCE' });
    }
  };
  
  const getActionIcon = (type) => {
    switch(type) {
      case 'navigate': return '🌐';
      case 'click': return '👆';
      case 'type': return '⌨️';
      case 'wait': return '⏱️';
      case 'screenshot': return '📷';
      default: return '🔹';
    }
  };
  
  const getActionText = (action) => {
    return action.description || action.value || action.selector || 'Unknown action';
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <span>Automation Sequences</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, marginRight: 8 }}>
            <input
              type="checkbox"
              checked={headless}
              onChange={e => setHeadless(e.target.checked)}
              style={{ marginRight: 4 }}
            />
            Headless
          </label>
          <AddButton onClick={handleAddSequence}>+</AddButton>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {sequences.length === 0 ? (
          <EmptyState>
            <span>📋</span>
            <p>No sequences yet</p>
            <p>Record your first automation or create one manually</p>
          </EmptyState>
        ) : (
          <SequenceList>
            {sequences.map(sequence => {
              const playback = playbackStates[sequence.id] || {};
              return (
                <React.Fragment key={sequence.id}>
                  <SequenceItem 
                    isActive={activeSequence === sequence.id}
                    onClick={() => handleSequenceClick(sequence.id)}
                  >
                    <SequenceIcon>📋</SequenceIcon>
                    <SequenceTitle>{sequence.title}</SequenceTitle>
                    {/* Playback status indicator */}
                    {playback.status && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: playback.status === 'error' ? 'red' : playback.status === 'playing' ? 'green' : '#888' }}>
                        {playback.status}
                      </span>
                    )}
                    <SequenceControls>
                      <ControlButton 
                        onClick={e => { e.stopPropagation(); handleExpandClick(sequence.id); }}
                      >
                        {expandedSequence === sequence.id ? '▼' : '▶'}
                      </ControlButton>
                      <ControlButton 
                        onClick={e => { e.stopPropagation(); handlePlaySequence(sequence.id); }}
                        disabled={playback.status === 'playing'}
                      >
                        ▶️
                      </ControlButton>
                      <ControlButton 
                        onClick={e => { e.stopPropagation(); handlePauseSequence(sequence.id); }}
                        disabled={playback.status !== 'playing'}
                      >
                        ⏸️
                      </ControlButton>
                      <ControlButton 
                        onClick={e => { e.stopPropagation(); handleResumeSequence(sequence.id); }}
                        disabled={playback.status !== 'paused'}
                      >
                        ⏵️
                      </ControlButton>
                      <ControlButton 
                        onClick={e => { e.stopPropagation(); handleStopSequence(sequence.id); }}
                        disabled={playback.status !== 'playing' && playback.status !== 'paused'}
                      >
                        ⏹️
                      </ControlButton>
                      <ControlButton 
                        onClick={e => { e.stopPropagation(); handleDeleteSequence(sequence.id); }}
                        disabled={playback.status === 'playing'}
                      >
                        🗑️
                      </ControlButton>
                    </SequenceControls>
                  </SequenceItem>
                  {/* Error handling UI */}
                  {playback.status === 'error' && (
                    <div style={{ color: 'red', marginLeft: 32, marginBottom: 4 }}>
                      <div>Error: {playback.error}</div>
                      <button onClick={() => handleRetrySequence(sequence.id)}>Retry</button>
                      <button onClick={() => handleSkipSequence(sequence.id)} style={{ marginLeft: 8 }}>Skip</button>
                      <button onClick={() => handleStopSequence(sequence.id)} style={{ marginLeft: 8 }}>Stop</button>
                    </div>
                  )}
                  {/* Progress reporting UI */}
                  {playback.progress && (
                    <div style={{ marginLeft: 32, marginBottom: 4, fontSize: 12 }}>
                      <div>Progress: {playback.progress.percentage}% | Step {playback.progress.current + 1} / {playback.progress.total}</div>
                      <div>Status: {playback.progress.status}</div>
                      <div>Current Action: <code>{playback.progress.currentAction ? playback.progress.currentAction.type : '-'}</code></div>
                      <div>Elapsed: {(playback.progress.executionTimeMs / 1000).toFixed(1)}s</div>
                      <div>Log:
                        <ul style={{ maxHeight: 60, overflowY: 'auto', fontSize: 11, paddingLeft: 18 }}>
                          {playback.progress.log.map((entry, i) => (
                            <li key={i} style={{ color: entry.type === 'error' ? 'red' : 'green' }}>
                              [{entry.type}] Step {entry.index + 1}: {entry.action.type} {entry.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {expandedSequence === sequence.id && (
                    <ActionList>
                      {sequence.actions.map((action, index) => (
                        <ActionItem key={index}>
                          <ActionIcon>{getActionIcon(action.type)}</ActionIcon>
                          {getActionText(action)}
                        </ActionItem>
                      ))}
                    </ActionList>
                  )}
                </React.Fragment>
              );
            })}
          </SequenceList>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <FooterButton>Import</FooterButton>
        <FooterButton>Export</FooterButton>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;