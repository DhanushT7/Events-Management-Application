import { useState, useCallback } from 'react';
import axios from 'axios';
import { eventState } from '../../../../shared/context/eventProvider';

export const useFormState = (setOpenForm, fetchEvents, enqueueSnackbar) => {
  const { user } = eventState();
  
  const initialFormState = {
    title: "",
    startDate: "",
    endDate: "",
    venue: "",
    mode: "Online",
    duration: "",
    type: "",
    objectives: "",
    outcomes: "",
    budget: "",
    coordinators: [
      { 
        name: user?.name || "", 
        designation: user?.designation || "", 
        department: user?.department || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)" 
      }
    ],
    targetAudience: [],
    resourcePersons: [],
    registrationProcedure: {
      enabled: false,
      instructions: "",
      submissionMethod: "email",
      deadline: "",
      participantLimit: "",
      selectionCriteria: "first come first served basis",
      confirmationDate: "",
      confirmationMethod: "email",
      certificateRequirements: {
        enabled: false,
        attendanceRequired: true,
        evaluation: {
          quiz: { enabled: false, percentage: 0 },
          assignment: { enabled: false, percentage: 0 },
          labWork: { enabled: false, percentage: 0 },
          finalTest: { enabled: false, percentage: 0 }
        }
      },
      additionalNotes: "",
      paymentDetails: {
        enabled: false,
        accountName: "DIRECTOR, CSRC",
        accountNumber: "37614464781",
        accountType: "SAVINGS",
        bankBranch: "State Bank of India, Anna University",
        ifscCode: "SBIN0006463",
        additionalPaymentInfo: ""
      },
      registrationForm: {
        enabled: false,
        fields: {
          name: true,
          ageAndDob: true,
          qualification: true,
          institution: true,
          category: {
            enabled: true,
            options: [
              "Student from a Non-Government School",
              "Student of / who has just passed Class XII from a Government School*",
              "A programming enthusiast"
            ]
          },
          address: true,
          email: true,
          mobile: true,
          signature: true
        },
        additionalRequirements: "*Proof has to be submitted with the application",
        customFields: []
      }
    },
    approvers: [{ name: "", role: "" }],
    organizingDepartments: {
      primary: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
      associative: [],
    },
    departmentApprovers: [
      {
        department: "DCSE",
        hodName: "",
        hodDesignation: "HoD, DCSE & Director, CCS",
        approved: false,
        approvedDate: "",
        signature: ""
      }
    ],
    budgetBreakdown: {
      income: [
        {
          category: "",
          expectedParticipants: "",
          perParticipantAmount: "",
          gstPercentage: "",
          income: 0,
        },
      ],
      expenses: [{ category: "", amount: "" }],
      totalIncome: 0,
      totalExpenditure: "0",
      universityOverhead: "0",
      gstAmount: "",
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [newTargetAudience, setNewTargetAudience] = useState("");
  const [newResourcePerson, setNewResourcePerson] = useState("");

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setNewTargetAudience("");
    setNewResourcePerson("");
  }, [initialFormState]);

  const validateForm = useCallback(() => {
    // 1. Basic required fields
    const requiredFields = {
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      venue: formData.venue,
      duration: formData.duration,
      type: formData.type,
      objectives: formData.objectives,
      outcomes: formData.outcomes,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // 2. Coordinators validation
    if (!formData.coordinators?.length) {
      console.error("At least one coordinator required");
      return false;
    }
    for (const coord of formData.coordinators) {
      if (
        !coord.name?.trim() ||
        !coord.designation?.trim() ||
        !coord.department?.trim()
      ) {
        console.error("Coordinator missing name, designation or department");
        return false;
      }
    }

    // 3. Target audience validation
    if (!formData.targetAudience?.length) {
      console.error("Target audience required");
      return false;
    }

    // 4. Financials - Income validation
    if (!formData.budgetBreakdown?.income?.length) {
      console.error("At least one income category required");
      return false;
    }
    for (const income of formData.budgetBreakdown.income) {
      if (
        !income.category?.trim() ||
        isNaN(income.expectedParticipants) ||
        isNaN(income.perParticipantAmount) ||
        isNaN(income.gstPercentage)
      ) {
        console.error("Invalid income entry");
        return false;
      }
    }

    // 5. Financials - Expenses validation
    if (!formData.budgetBreakdown?.expenses?.length) {
      console.error("At least one expense category required");
      return false;
    }
    for (const exp of formData.budgetBreakdown.expenses) {
      if (!exp.category?.trim() || isNaN(exp.amount)) {
        console.error("Invalid expense entry");
        return false;
      }
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (submitting) return;
    setSubmitting(true);

    try {
      const isValid = validateForm();
      if (!isValid) {
        enqueueSnackbar("Please fill all required fields correctly", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return;
      }

      // Date validation
      if (!formData.startDate || isNaN(new Date(formData.startDate))) {
        throw new Error("Start Date is missing or invalid");
      }
      if (!formData.endDate || isNaN(new Date(formData.endDate))) {
        throw new Error("End Date is missing or invalid");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        enqueueSnackbar("Session expired. Please login again.", {
          variant: "error",
          persist: true,
        });
        return;
      }

      // Get HOD info
      const hodResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/getHOD?id=${user._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const hod = await hodResponse.json();

      // Build FormData
      const formPayload = new FormData();

      formPayload.append("title", formData.title.trim());
      formPayload.append("startDate", new Date(formData.startDate).toISOString());
      formPayload.append("endDate", new Date(formData.endDate).toISOString());
      formPayload.append("venue", formData.venue.trim());
      formPayload.append("mode", formData.mode);
      formPayload.append("duration", formData.duration.trim());
      formPayload.append("type", formData.type.trim());
      formPayload.append("objectives", formData.objectives.trim());
      formPayload.append("outcomes", formData.outcomes.trim());
      formPayload.append("budget", formData.budget ? formData.budget.toString() : "0");

      formPayload.append("createdBy", user._id);
      formPayload.append("reviewedBy", hod._id);

      // Append JSON fields safely
      formPayload.append("coordinators", JSON.stringify(formData.coordinators || []));
      formPayload.append("targetAudience", JSON.stringify(formData.targetAudience || []));
      formPayload.append("resourcePersons", JSON.stringify(formData.resourcePersons || []));
      formPayload.append("registrationProcedure", JSON.stringify(formData.registrationProcedure));
      formPayload.append("approvers", JSON.stringify(formData.approvers || []));
      formPayload.append("organizingDepartments", JSON.stringify(formData.organizingDepartments || {
        primary: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
        associative: []
      }));
      formPayload.append("departmentApprovers", JSON.stringify(formData.departmentApprovers || []));
      formPayload.append("budgetBreakdown", JSON.stringify({
        income: formData.budgetBreakdown?.income || [],
        expenses: formData.budgetBreakdown?.expenses || [],
        totalIncome: formData.budgetBreakdown?.totalIncome || 0,
        totalExpenditure: formData.budgetBreakdown?.totalExpenditure || 0,
        universityOverhead: formData.budgetBreakdown?.universityOverhead || 0,
      }));

      if (formData.brochure instanceof File) {
        if (formData.brochure.size > 10 * 1024 * 1024) {
          throw new Error("File size exceeds 10MB limit");
        }
        formPayload.append("brochure", formData.brochure);
      }

      if (editId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes/${editId}`,
          formPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        enqueueSnackbar("Note Order updated successfully!", { variant: "success" });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/programmes`,
          formPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        enqueueSnackbar("Note Order created successfully!", { variant: "success" });
      }

      // Final common steps after create/edit
      await fetchEvents();
      setOpenForm(false);
      setEditId(null);
      resetForm();
      setActiveStep(0);

    } catch (error) {
      console.error("❌ Submission error:", error);

      if (error.response) {
        const serverData = error.response.data;
        const message = serverData.message || 
          (typeof serverData === "string" ? serverData : 
           serverData.errors ? Object.values(serverData.errors).join(", ") : 
           "Something went wrong");
        enqueueSnackbar(message, { variant: "error", autoHideDuration: 4000 });
      } else if (error.request) {
        enqueueSnackbar("No response from server. Check your connection.", {
          variant: "error",
          autoHideDuration: 4000,
        });
      } else {
        enqueueSnackbar(`Error: ${error.message}`, {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }, [formData, editId, submitting, user, validateForm, enqueueSnackbar, fetchEvents, setOpenForm, resetForm]);

  return {
    formData,
    setFormData,
    editId,
    setEditId,
    activeStep,
    setActiveStep,
    submitting,
    resetForm,
    handleSubmit,
    newTargetAudience,
    setNewTargetAudience,
    newResourcePerson,
    setNewResourcePerson
  };
};