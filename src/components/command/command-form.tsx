import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Command, CreateCommandInput } from '@/types/command';

const commandFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  script: z.string().min(1, 'Script is required'),
  tags: z.string().optional(),
});

type CommandFormData = z.infer<typeof commandFormSchema>;

interface CommandFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCommandInput) => Promise<void>;
  command?: Command;
  title?: string;
  description?: string;
}

export function CommandForm({
  open,
  onOpenChange,
  onSubmit,
  command,
  title = 'Create Command',
  description = 'Add a new command to execute.',
}: CommandFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CommandFormData>({
    resolver: zodResolver(commandFormSchema),
    defaultValues: {
      name: command?.name || '',
      description: command?.description || '',
      script: command?.script || '',
      tags: command?.tags?.join(', ') || '',
    },
  });
  
  const handleSubmit = async (data: CommandFormData) => {
    setIsSubmitting(true);
    try {
      const commandData: CreateCommandInput = {
        name: data.name,
        description: data.description || undefined,
        script: data.script,
        folder_path: '/',
        tags: data.tags 
          ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : undefined,
      };
      
      await onSubmit(commandData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit command:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Command" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short, descriptive name for your command.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="What does this command do?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="npm run build"
                      className="min-h-[80px] font-mono"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The command or script to execute.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="build, npm, production" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags to help organize commands.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Command'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}