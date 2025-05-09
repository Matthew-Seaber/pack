"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/extension/multi-select";

import { TagsInput } from "@/components/ui/extension/tags-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  yearGroup: z.string(),
  educationLevel: z.string(),
  name_0764670473: z.array(z.string()).nonempty("Please at least one item"),
  otherSubjects: z
    .array(z.string())
    .nonempty("Please at least one item")
    .optional(),
  reviseFrequency: z.string(),
  revisionMethods: z.array(z.string()).nonempty("Please at least one item"),
  revisionApps: z.array(z.string()).nonempty("Please at least one item"),
  moneyMonth: z.string(),
  moneyOne: z.string(),
  tutor: z.string().optional(),
  motivation: z.array(z.string()).nonempty("Please at least one item"),
  dislikes: z.array(z.string()).nonempty("Please at least one item"),
  name_2918344441: z.array(z.string()).nonempty("Please at least one item"),
  newFeatures: z.string().min(1),
  name_5557725765: z.string().min(1).optional(),
  email: z.string().optional(),
  marketing: z.boolean().default(true).optional(),
});

function MarketResearchPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_0764670473: ["React"],
      otherSubjects: ["test"],
      revisionMethods: ["React"],
      revisionApps: ["React"],
      motivation: ["React"],
      dislikes: ["React"],
      name_2918344441: ["React"],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <>
      <h1 className="text-3xl pb-10">Pack Market Research</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-3xl mx-auto py-10"
        >
          <FormField
            control={form.control}
            name="yearGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year group</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your year group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Year 9">Year 9</SelectItem>
                    <SelectItem value="Year 10">Year 10</SelectItem>
                    <SelectItem value="Year 11">Year 11</SelectItem>
                    <SelectItem value="Year 12">Year 12</SelectItem>
                    <SelectItem value="Year 13">Year 13</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Please select your year group.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="educationLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GCSEs">GCSEs</SelectItem>
                    <SelectItem value="A Levels">A Levels</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Please select whether you&#39;re studying GCSEs or A Levels.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name_0764670473"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What subjects do you study?</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select subjects" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"ABiology"}>
                          Biology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GBiology"}>
                          Biology (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"ABusiness"}>
                          Business (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GBusiness"}>
                          Business (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AChemistry"}>
                          Chemistry (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GChemistry"}>
                          Chemistry (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCitizenship"}>
                          Citizenship (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AComputer Science"}>
                          Computer Science (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GComputer Science"}>
                          Computer Science (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"ACriminology"}>
                          Criminology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"ADrama"}>
                          Drama (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GDrama"}>
                          Drama (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AEconomics"}>
                          Economics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AEnglish Language"}>
                          English Language (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GEnglish Language"}>
                          English Language (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AEnglish Literature"}>
                          English Literature (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GEnglish Literature"}>
                          English Literature (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AFine Art"}>
                          Fine Art (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GFine Art"}>
                          Fine Art (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"GFood Preparation and Nutrition"}
                        >
                          Food Preparation and Nutrition (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"L3Food Science"}>
                          Food Science (Level 3)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AFrench"}>
                          French (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GFrench"}>
                          French (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AFurther Maths"}>
                          Further Maths (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"L2Further Maths"}>
                          Further Maths (Level 2)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AGeography"}>
                          Geography (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GGeography"}>
                          Geography (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AGerman"}>
                          German (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GGerman"}>
                          German (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AGraphics Communications"}>
                          Graphics Communications (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GGraphics Communications"}>
                          Graphics Communications (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AHistory"}>
                          History (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GHistory"}>
                          History (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GLatin"}>
                          Latin (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AMaths"}>
                          Maths (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GMaths"}>
                          Maths (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GMusic"}>
                          Music (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"APhysical Education"}>
                          Physical Education (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GPhysical Education"}>
                          Physical Education (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"APhysics"}>
                          Physics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GPhysics"}>
                          Physics (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"APolitics"}>
                          Politics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AProduct Design"}>
                          Product Design (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GProduct Design"}>
                          Product Design (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"APsychology"}>
                          Psychology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AReligious Studies"}>
                          Religious Studies (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GReligious Studies"}>
                          Religious Studies (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"ASociology"}>
                          Sociology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"ASpanish"}>
                          Spanish (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GSpanish"}>
                          Spanish (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"AStatistics"}>
                          Statistics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"ATextiles"}>
                          Textiles (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GTextiles"}>
                          Textiles (GCSE)
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>
                  Select multiple options (type to search).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherSubjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other subjects (excluding BTECs)</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value || ["TEST"]}
                    onValueChange={field.onChange}
                    placeholder="Enter your tags"
                  />
                </FormControl>
                <FormDescription>
                  Please enter any other subjects you study not listed above
                  (press enter to submit).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reviseFrequency"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>How often do you revise?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    className="flex flex-col space-y-1"
                  >
                    {[
                      ["Male", "male"],
                      ["Female", "female"],
                      ["Other", "other"],
                    ].map((option, index) => (
                      <FormItem
                        className="flex items-center space-x-3 space-y-0"
                        key={index}
                      >
                        <FormControl>
                          <RadioGroupItem value={option[1]} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option[0]}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Select from the options above.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revisionMethods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What revision methods do you use?</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select languages" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"React"}>
                          React
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Vue"}>Vue</MultiSelectorItem>
                        <MultiSelectorItem value={"Svelte"}>
                          Svelte
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>Select multiple options.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revisionApps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other revision methods.</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Enter your tags"
                  />
                </FormControl>
                <FormDescription>
                  Please enter any other revision methods not listed above
                  (press enter to submit).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revisionApps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other revision apps.</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Enter your tags"
                  />
                </FormControl>
                <FormDescription>Add tags.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revisionApps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What revision apps do you use?</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select languages" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"React"}>
                          React
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Vue"}>Vue</MultiSelectorItem>
                        <MultiSelectorItem value={"Svelte"}>
                          Svelte
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>Select multiple options.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <FormField
                control={form.control}
                name="moneyMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      How much do you spend on revision apps per month?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a value." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="m@example.com">
                          m@example.com
                        </SelectItem>
                        <SelectItem value="m@google.com">
                          m@google.com
                        </SelectItem>
                        <SelectItem value="m@support.com">
                          m@support.com
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Please select the combined amount you spend on online
                      revision apps/websites every month.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="moneyOne"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  How much have you spent on one-time purchase revision apps?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a value." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m@example.com">m@example.com</SelectItem>
                    <SelectItem value="m@google.com">m@google.com</SelectItem>
                    <SelectItem value="m@support.com">m@support.com</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Please select the combined amount you have spent on one-time
                  online revision apps/websites.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tutor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  If applicable, how much do you spend on a tutor per hour?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m@example.com">m@example.com</SelectItem>
                    <SelectItem value="m@google.com">m@google.com</SelectItem>
                    <SelectItem value="m@support.com">m@support.com</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Please select the amount you spend an hour for a tutor.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="motivation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What motivates you to revise?</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select languages" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"React"}>
                          React
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Vue"}>Vue</MultiSelectorItem>
                        <MultiSelectorItem value={"Svelte"}>
                          Svelte
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>Select multiple options.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dislikes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you dislike about revising?</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select languages" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"React"}>
                          React
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Vue"}>Vue</MultiSelectorItem>
                        <MultiSelectorItem value={"Svelte"}>
                          Svelte
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>Select multiple options.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name_2918344441"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you struggle with when revising?</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="max-w-xs"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select languages" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"React"}>
                          React
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Vue"}>Vue</MultiSelectorItem>
                        <MultiSelectorItem value={"Svelte"}>
                          Svelte
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>Select multiple options.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newFeatures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What would you like to see in a new revision app?
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter some features" type="" {...field} />
                </FormControl>
                <FormDescription>
                  These can be features of existing apps or new ideas you&#39;d
                  like to see.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name_5557725765"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Any other thoughts or ideas you&#39;d like to share?
                </FormLabel>
                <FormControl>
                  <Input placeholder="Final feedback" type="" {...field} />
                </FormControl>
                <FormDescription>
                  Please enter any final comments.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is required to be entered into the £5 Amazon gift card
                  prize draw. You must have also fully filled in the rest of the
                  form for your entry to be valid.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="marketing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Marketing emails</FormLabel>
                  <FormDescription>
                    Be the first to be notified when Pack is released to the
                    public. You can unsubscribe at any time.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
}

export default MarketResearchPage;
