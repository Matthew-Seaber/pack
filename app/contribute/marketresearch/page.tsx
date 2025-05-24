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
import { Slider } from "@/components/ui/slider";

import { supabase } from "../../../lib/supabase";

const formSchema = z.object({
  yearGroup: z.string().nonempty("Required"),
  subjects: z.array(z.string()).nonempty("Required"),
  otherSubjects: z.array(z.string()).optional(),
  reviseFrequency: z.string().nonempty("Required"),
  devices: z.array(z.string()).nonempty("Please enter at least one item"),
  revisionMethods: z
    .array(z.string())
    .nonempty("Please enter at least one item"),
  otherMethods: z.array(z.string()).optional(),
  revisionApps: z.array(z.string()).optional(),
  otherApps: z.array(z.string()).optional(),
  moneyMonth: z.string().nonempty("Required"),
  moneyOne: z.string().nonempty("Required"),
  tutor: z.string().optional(),
  motivation: z.array(z.string()).nonempty("Please enter at least one item"),
  dislikes: z.array(z.string()).nonempty("Please enter at least one item"),
  struggle: z.array(z.string()).nonempty("Please enter at least one item"),
  newFeatures: z.string().optional(),
  finalThoughts: z.string().optional(),
  email: z.string().optional(),
  marketing: z.boolean().optional(),
  pomodoro: z.string().nonempty("Required"),
  curricularSlider: z.number().min(0).max(9),
});

function MarketResearchPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearGroup: "",
      subjects: [],
      otherSubjects: [],
      reviseFrequency: "",
      devices: [],
      revisionMethods: [],
      otherMethods: [],
      revisionApps: [],
      otherApps: [],
      moneyMonth: "",
      moneyOne: "",
      tutor: "",
      motivation: [],
      dislikes: [],
      struggle: [],
      newFeatures: "",
      finalThoughts: "",
      email: "",
      marketing: true,
      pomodoro: "",
      curricularSlider: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from("market_research_submissions")
        .insert([values]);

      if (error) throw error;

      console.log("Inserted successfully:", data);
      console.log(values);

      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <h3>Done</h3>
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );

      toast.success(
        `Form submitted successfully; thanks for your response!${
          values.email ? " Good luck!" : ""
        }`
      );

      form.reset();
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <>
      <h1 className="text-3xl pb-5 text-center font-medium">
        Pack Market Research
      </h1>
      <h2 className="text-1xl pb-5 text-center">
        For a chance to win a £5 Amazon gift card, fill in the short form below
        to help form how Pack is developed.
      </h2>

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
                <FormLabel>Year group *</FormLabel>
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
            name="subjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What subjects do you study? *</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                    loop
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select subjects" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"A Level Biology"}>
                          Biology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Biology"}>
                          Biology (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Business"}>
                          Business (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Business"}>
                          Business (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Chemistry"}>
                          Chemistry (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Chemistry"}>
                          Chemistry (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Citizenship"}>
                          Citizenship (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Computer Science"}>
                          Computer Science (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Computer Science"}>
                          Computer Science (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Criminology"}>
                          Criminology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Drama"}>
                          Drama (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Drama"}>
                          Drama (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Economics"}>
                          Economics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level English Language"}>
                          English Language (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE English Language"}>
                          English Language (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level English Literature"}>
                          English Literature (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE English Literature"}>
                          English Literature (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Fine Art"}>
                          Fine Art (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Fine Art"}>
                          Fine Art (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"GCSE Food Preparation and Nutrition"}
                        >
                          Food Preparation and Nutrition (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Level 3 Food Science"}>
                          Food Science (Level 3)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level French"}>
                          French (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE French"}>
                          French (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Further Maths"}>
                          Further Maths (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Level 2 Further Maths"}>
                          Further Maths (Level 2)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Geography"}>
                          Geography (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Geography"}>
                          Geography (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level German"}>
                          German (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE German"}>
                          German (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"A Level Graphics Communications"}
                        >
                          Graphics Communications (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"GCSE Graphics Communications"}
                        >
                          Graphics Communications (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level History"}>
                          History (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE History"}>
                          History (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Latin"}>
                          Latin (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Maths"}>
                          Maths (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Maths"}>
                          Maths (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Music"}>
                          Music (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Physical Education"}>
                          Physical Education (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Physical Education"}>
                          Physical Education (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Physics"}>
                          Physics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Physics"}>
                          Physics (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Politics"}>
                          Politics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Product Design"}>
                          Product Design (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Product Design"}>
                          Product Design (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Psychology"}>
                          Psychology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Religious Studies"}>
                          Religious Studies (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Religious Studies"}>
                          Religious Studies (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Sociology"}>
                          Sociology (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Spanish"}>
                          Spanish (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Spanish"}>
                          Spanish (GCSE)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Statistics"}>
                          Statistics (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"A Level Textiles"}>
                          Textiles (A Level)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSE Textiles"}>
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
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Enter any additional subjects you study"
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
                <FormLabel>How often do you revise? *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    className="flex flex-col space-y-1"
                  >
                    {[
                      ["Almost every day", "everyDay"],
                      ["A few times a week", "fewWeek"],
                      ["Once or twice a week", "onceTwiceWeek"],
                      ["Just before tests", "beforeTests"],
                      ["Very rarely", "rarely"],
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
            name="devices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Which of the following devices do you have access to? *
                </FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                    loop
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select device(s)" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"Desktop"}>
                          Desktop
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Laptop"}>
                          Laptop
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Phone"}>
                          Phone
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Tablet"}>
                          Tablet
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>
                  Select multiple options if applicable.
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
                <FormLabel>
                  Which of these revision methods do you use? *
                </FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                    loop
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select revision methods" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"Blurting"}>
                          Blurting
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Flashcards"}>
                          Flashcards
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Mind Maps"}>
                          Mind Maps
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Mnemonics/Songs"}>
                          Mnemonics/Songs
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Past Papers"}>
                          Past Papers
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Podcasts/Videos"}>
                          Podcasts/Videos
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Reading Notes"}>
                          Reading Notes
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Teaching Others"}>
                          Teaching Others
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
            name="otherMethods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other revision methods.</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Enter any other revision methods you use"
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
                <FormLabel>
                  Which of these revision apps/websites do you use?
                </FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                    loop
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select revision apps" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"Adapt"}>
                          Adapt
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Anki"}>
                          Anki
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"BBC Bitesize"}>
                          BBC Bitesize
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Brainscape"}>
                          Brainscape
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Cognito"}>
                          Cognito
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"ExamQ"}>
                          ExamQ
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Exam Solutions"}>
                          Exam Solutions
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"GCSEPod"}>
                          GCSEPod
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Gizmo"}>
                          Gizmo
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Physics and Maths Tutor"}>
                          Physics and Maths Tutor
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Quizlet"}>
                          Quizlet
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Revision World"}>
                          Revision World
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Save My Exams"}>
                          Save My Exams
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Seneca"}>
                          Seneca
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Smart Revise"}>
                          Smart Revise
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"StudySmarter"}>
                          StudySmarter
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Tassomai"}>
                          Tassomai
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
            name="otherApps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other revision apps.</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Enter any other revision apps you use"
                  />
                </FormControl>
                <FormDescription>
                  Please enter any other revision apps not listed above (press
                  enter to submit).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pomodoro"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  What do you think about the Pomodoro technique? *
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    className="flex flex-col space-y-1"
                  >
                    {[
                      ["I like it", "like"],
                      ["I don't like it", "onceTwiceWeek"],
                      ["Never used it", "never"],
                      ["Not heard of it", "notHeard"],
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
            name="moneyMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  How much do you spend on revision apps per month? *
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
                    <SelectItem value="0">£0</SelectItem>
                    <SelectItem value="5">£0-£5</SelectItem>
                    <SelectItem value="15">£5-£15</SelectItem>
                    <SelectItem value="30">£15-£30</SelectItem>
                    <SelectItem value="+">£30+</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Please select the combined amount you spend on online revision
                  apps/websites every month.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="moneyOne"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  How much have you spent on one-time purchase revision apps? *
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
                    <SelectItem value="0">£0</SelectItem>
                    <SelectItem value="5">£0-£5</SelectItem>
                    <SelectItem value="15">£5-£15</SelectItem>
                    <SelectItem value="30">£15-£30</SelectItem>
                    <SelectItem value="+">£30+</SelectItem>
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
                  How much do you/are you willing to spend on a tutor per hour?
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
                    <SelectItem value="0">£0-£15</SelectItem>
                    <SelectItem value="5">£15-£25</SelectItem>
                    <SelectItem value="15">£25-£35</SelectItem>
                    <SelectItem value="30">£35-£50</SelectItem>
                    <SelectItem value="+">£50+</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Please select the average amount you(&apos;d) spend an hour
                  for a tutor.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="curricularSlider"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>
                  Number of extra/super curricular activities you do a week *:{" "}
                  {value === 9 ? "8+" : value}
                </FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={9}
                    step={1}
                    defaultValue={[0]}
                    onValueChange={(vals) => {
                      onChange(vals[0]);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Adjust the number of activities/clubs you currently undertake on an
                  average week by sliding.
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
                <FormLabel>What motivates you to revise? *</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select from list" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"Fear of failure"}>
                          Fear of failure
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Feeling guilty when not revising"}
                        >
                          Feeling guilty when not revising
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Friends revising"}>
                          Friends revising
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Getting good grades in upcoming exams"}
                        >
                          Getting good grades in upcoming exams
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Having self-set goals"}>
                          Having self-set goals
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Improving confidence"}>
                          Improving confidence
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={
                            "Obtaining required grades for a future course"
                          }
                        >
                          Obtaining required grades for a future course (e.g. A
                          Level/College, University etc.)
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Parents'/teachers' expectations"}
                        >
                          Parents&apos;/teachers&apos; expectations
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Reward system"}>
                          Reward system (of any scale e.g. money if you achieve
                          target grades)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Staying in a certain set"}>
                          Staying in a certain set
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
                <FormLabel>
                  What puts you off revising in the first place? *
                </FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select from list" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem
                          value={
                            "Believing you'll do well without any revision"
                          }
                        >
                          Believing you&apos;ll do well without any revision
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Burnout from past revision"}>
                          Burnout from past revision
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Lack of interest in the subject"}
                        >
                          Lack of interest in the subject
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Lack of time"}>
                          Lack of time
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Thinking revision is a waste of time"}
                        >
                          Thinking revision is a waste of time
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Thinking revision is boring"}
                        >
                          Thinking revision is boring
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Thinking revision is repetitive"}
                        >
                          Thinking revision is repetitive
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Thinking revision requires too much effort"}
                        >
                          Thinking revision requires too much effort
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Thinking revision won't help"}
                        >
                          Thinking revision won&apos;t help
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Wanting to do other things instead"}
                        >
                          Wanting to do other things instead
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
            name="struggle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What do you struggle with while revising? *
                </FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select from list" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value={"Avoiding distractions"}>
                          Avoiding distractions (e.g. phone, social media etc.)
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Feeling overwhelmed"}>
                          Feeling overwhelmed
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Keeping yourself motivated"}>
                          Keeping yourself motivated
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Knowing what to revise"}>
                          Knowing what to revise
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Making revision active rather than passive"}
                        >
                          Making revision active rather than passive
                        </MultiSelectorItem>
                        <MultiSelectorItem value={"Not knowing how to revise"}>
                          Not knowing how to revise a certain topic/subject
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Staying focused for long periods of time"}
                        >
                          Staying focused for long periods of time
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Sticking to a revision plan"}
                        >
                          Sticking to a revision plan
                        </MultiSelectorItem>
                        <MultiSelectorItem
                          value={"Understanding difficult topics"}
                        >
                          Understanding difficult topics
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
                  What would you like to see in a new all-in-one revision app?
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
            name="finalThoughts"
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
