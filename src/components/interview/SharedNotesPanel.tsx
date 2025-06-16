import React, { useEffect, useState } from 'react';
import { useInterview } from '@/contexts/InterviewContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Share2 } from 'lucide-react';

interface SharedNotesPanelProps {
  roomId: string;
}

export function SharedNotesPanel({ roomId }: SharedNotesPanelProps) {
  const { 
    sharedNotes, 
    setSharedNotes, 
    isEditingSharedNotes, 
    setIsEditingSharedNotes,
    lastSharedNotesUpdate,
    notes,
    setNotes
  } = useInterview();
  
  const { 
    notesSocket, 
    notesConnected, 
    connectNotesSocket, 
    sendNoteUpdate 
  } = useWebSocket();
  
  const { toast } = useToast();
  const [localNotes, setLocalNotes] = useState(sharedNotes);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<string>('private');
  
  // Connect to notes WebSocket on component mount
  useEffect(() => {
    if (roomId) {
      connectNotesSocket(roomId);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [roomId, connectNotesSocket]);
  
  // Set up WebSocket message listener
  useEffect(() => {
    if (!notesSocket) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'update' && !isEditingSharedNotes) {
          setSharedNotes(data.content);
          setLocalNotes(data.content);
        } else if (data.type === 'initial') {
          setSharedNotes(data.content);
          setLocalNotes(data.content);
        }
      } catch (error) {
        console.error('Error parsing notes message:', error);
      }
    };
    
    notesSocket.addEventListener('message', handleMessage);
    
    return () => {
      notesSocket.removeEventListener('message', handleMessage);
    };
  }, [notesSocket, isEditingSharedNotes, setSharedNotes]);
  
  // Handle local note changes with debounce
  const handleSharedNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalNotes(newValue);
    setIsEditingSharedNotes(true);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    const timeout = setTimeout(() => {
      setSharedNotes(newValue);
      sendNoteUpdate(newValue);
      setIsEditingSharedNotes(false);
    }, 500); // 500ms debounce
    
    setTypingTimeout(timeout);
  };
  
  // Handle private notes changes
  const handlePrivateNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            Notes
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Private notes are only visible to you. Shared notes are visible to all participants.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeTab === 'shared' && (
              notesConnected ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Disconnected
                </Badge>
              )
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-2">
        <Tabs defaultValue="private" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mb-2">
            <TabsTrigger value="private">Private Notes</TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Shared Notes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="flex-grow">
            <Textarea
              className="h-full min-h-[200px] resize-none"
              placeholder="Your private notes here..."
              value={notes}
              onChange={handlePrivateNotesChange}
            />
          </TabsContent>
          
          <TabsContent value="shared" className="flex-grow">
            <Textarea
              className="h-full min-h-[200px] resize-none"
              placeholder="Type shared notes here..."
              value={localNotes}
              onChange={handleSharedNotesChange}
              disabled={!notesConnected}
            />
            {lastSharedNotesUpdate && (
              <div className="text-xs text-muted-foreground mt-2">
                Last updated: {lastSharedNotesUpdate.toLocaleTimeString()}
              </div>
            )}
            {!notesConnected && (
              <div className="text-xs text-red-500 mt-2">
                Not connected to shared notes service. Reconnecting...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 