"use client";

import React, { useEffect, useState, use } from "react";
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Card, 
  Stack, 
  Group, 
  Avatar, 
  ThemeIcon, 
  Box, 
  Center, 
  Loader, 
  Divider,
  Transition,
  Paper,
  Badge,
  SimpleGrid
} from "@mantine/core";
import { 
  IconCheck, 
  IconRocket, 
  IconConfetti, 
  IconBriefcase, 
  IconSparkles,
  IconCircleCheckFilled,
  IconArrowRight,
  IconMapPin
} from "@tabler/icons-react";
import { fetchCandidateForInvite } from "@/app/actions/get";
import classes from "./ApplyPage.module.css";

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        const load = async () => {
            const result = await fetchCandidateForInvite(id);
            if (result.success) {
                setCandidate(result.data);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const handleApply = async () => {
        setConfirmLoading(true);
        try {
            const { updateCandidate } = await import("@/app/actions/update");
            const result = await updateCandidate({ 
                candidate_id: id, 
                status: 'ACTIVE' 
            });
            if (result.success) {
                setSubmitted(true);
            } else {
              throw new Error(result.message);
            }
        } catch (error) {
            console.error("Confirmation Error:", error);
        } finally {
            setConfirmLoading(false);
        }
    };

    if (loading) {
      return (
        <Center h="100vh" bg="#f8f9fa">
          <Stack align="center" gap="md">
            <Loader size="xl" color="blue.9" variant="bars" />
            <Text fw={700} c="blue.9">Verifying Invitation...</Text>
          </Stack>
        </Center>
      );
    }

    if (!candidate) {
      return (
        <Center h="100vh" bg="#f8f9fa">
          <Paper p="xl" radius="xl" withBorder shadow="xl" style={{ maxWidth: 400 }}>
            <Stack align="center" ta="center">
              <ThemeIcon size={64} radius={64} color="red.1" c="red.6">
                <IconBriefcase size={32} />
              </ThemeIcon>
              <Title order={2} fw={800}>Invite Not Found</Title>
              <Text c="dimmed" size="sm">This invitation link may have expired or is invalid. Please contact the recruitment team for a new link.</Text>
              <Button fullWidth variant="light" color="blue" onClick={() => window.location.href = "/"}>Back to Dashboard</Button>
            </Stack>
          </Paper>
        </Center>
      );
    }

    return (
      <Box className={classes.root}>
        <Container size="sm" py={80} style={{ position: 'relative', zIndex: 1 }}>
          <Transition mounted={mounted} transition="slide-up" duration={800} timingFunction="ease">
            {(styles) => (
              <Box style={styles}>
                {!submitted ? (
                  <Card p={0} radius="24px" shadow="xl" withBorder={false} className={classes.card}>
                    <Box className={classes.cardHeader}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap={4}>
                          <Badge variant="filled" color="blue.4" size="sm" radius="sm">OFFICIAL INVITATION</Badge>
                          <Title order={1} fw={900} size="32px" c="white">You're Invited!</Title>
                        </Stack>
                        <ThemeIcon size={60} radius="xl" color="rgba(255,255,255,0.2)" style={{ backdropFilter: 'blur(10px)' }}>
                          <IconSparkles size={30} color="white" />
                        </ThemeIcon>
                      </Group>
                    </Box>

                    <Box p={40}>
                      <Stack gap="xl">
                        <Group gap="xl">
                          <Avatar 
                             src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name.replace(/\s+/g, '')}`} 
                             size={100} 
                             radius={100} 
                             className={classes.avatar}
                          />
                          <Box style={{ flex: 1 }}>
                            <Text size="lg" fw={800} mb={4}>Hello, {candidate.name}!</Text>
                            <Text c="dimmed" fw={500}>We have reviewed your profile and would love for you to officially join our recruitment pipeline for the following role:</Text>
                          </Box>
                        </Group>

                        <Paper p="xl" radius="lg" withBorder bg="gray.0">
                           <Group justify="space-between">
                             <Box>
                               <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>Position</Text>
                               <Text size="xl" fw={900} c="blue.9">{candidate.role}</Text>
                               <Group gap={4} mt={4}>
                                 <IconMapPin size={14} color="gray" />
                                 <Text size="xs" c="dimmed" fw={600}>{candidate.department} • Remote / Hybrid</Text>
                               </Group>
                             </Box>
                             <ThemeIcon size={48} radius="md" variant="light" color="blue">
                               <IconBriefcase size={24} />
                             </ThemeIcon>
                           </Group>
                        </Paper>

                        <Stack gap="md">
                           <Text fw={700} size="sm">What's next?</Text>
                           <Group wrap="nowrap" align="flex-start" gap="md">
                             <ThemeIcon size="sm" radius="xl" color="teal.1" c="teal.6"><IconCheck size={12} /></ThemeIcon>
                             <Text size="sm" c="dimmed">Confirm your intent by clicking the button below.</Text>
                           </Group>
                           <Group wrap="nowrap" align="flex-start" gap="md">
                             <ThemeIcon size="sm" radius="xl" color="teal.1" c="teal.6"><IconCheck size={12} /></ThemeIcon>
                             <Text size="sm" c="dimmed">Our team will reach out to schedule your first screening call.</Text>
                           </Group>
                           <Group wrap="nowrap" align="flex-start" gap="md">
                             <ThemeIcon size="sm" radius="xl" color="teal.1" c="teal.6"><IconCheck size={12} /></ThemeIcon>
                             <Text size="sm" c="dimmed">Access your personal candidate portal to track progress.</Text>
                           </Group>
                        </Stack>

                        <Button 
                          fullWidth 
                          size="xl" 
                          radius="md" 
                          color="blue.9" 
                          rightSection={<IconArrowRight size={20} />}
                          onClick={handleApply}
                          loading={confirmLoading}
                          className={classes.confirmButton}
                        >
                          Confirm & Join Pipeline
                        </Button>

                        <Text size="xs" ta="center" c="dimmed">
                          By clicking the button, you agree to our recruitment privacy policy.
                        </Text>
                      </Stack>
                    </Box>
                  </Card>
                ) : (
                  <Card p={60} radius="24px" shadow="xl" ta="center">
                    <Stack align="center" gap="xl">
                      <Box className={classes.successIconWrapper}>
                        <IconCircleCheckFilled size={100} color="var(--mantine-color-teal-6)" />
                      </Box>
                      <Box>
                        <Title order={1} fw={900} size="42px">Application Confirmed!</Title>
                        <Text size="lg" c="dimmed" fw={500} mt="md">
                          Congratulations {candidate.name.split(' ')[0]}! You are now part of our recruitment process.
                        </Text>
                      </Box>
                      
                      <Divider w="100%" label="WHAT HAPPENS NOW" labelPosition="center" />

                      <SimpleGrid cols={3} w="100%" spacing="xl">
                         <Stack align="center" gap={8}>
                           <ThemeIcon size="lg" radius="xl" variant="light" color="blue">
                             <IconRocket size={20} />
                           </ThemeIcon>
                           <Text size="xs" fw={800}>Processing</Text>
                         </Stack>
                         <Stack align="center" gap={8}>
                           <ThemeIcon size="lg" radius="xl" variant="light" color="indigo">
                             <IconConfetti size={20} />
                           </ThemeIcon>
                           <Text size="xs" fw={800}>Reviewing</Text>
                         </Stack>
                         <Stack align="center" gap={8}>
                           <ThemeIcon size="lg" radius="xl" variant="light" color="teal">
                             <IconCheck size={20} />
                           </ThemeIcon>
                           <Text size="xs" fw={800}>Scheduling</Text>
                         </Stack>
                      </SimpleGrid>

                      <Button 
                        variant="light" 
                        color="blue" 
                        radius="md" 
                        onClick={() => window.location.href = "/"}
                        mt="xl"
                      >
                        Return to Dashboard Demo
                      </Button>
                    </Stack>
                  </Card>
                )}
              </Box>
            )}
          </Transition>
        </Container>
      </Box>
    );
}
