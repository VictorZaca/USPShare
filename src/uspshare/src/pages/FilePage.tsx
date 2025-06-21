// "use client"

// import { useParams } from "react-router-dom"
// import React, { useState } from "react"
// import {
//   Box,
//   Typography,
//   Container,
//   Grid,
//   Paper,
//   IconButton,
//   Chip,
//   TextField,
//   Button,
//   Divider,
//   Avatar,
//   Alert,
//   Link as MuiLink,
// } from "@mui/material"
// import {
//   ThumbUp as ThumbUpIcon,
//   FileOpen as FileOpenIcon,
//   Download as DownloadIcon,
//   Share as ShareIcon,
//   InsertDriveFile as InsertDriveFileIcon,
//   Person as PersonIcon,
//   CalendarMonth as CalendarMonthIcon,
//   ChatBubbleOutline as CommentIcon,
// } from "@mui/icons-material"
// import { mockFiles, mockComments } from "../lib/mock-data"

// export default function FilePage() {
//   const { id } = useParams()
//   const [comment, setComment] = useState("")
//   const [liked, setLiked] = useState(false)
//   const [likeCount, setLikeCount] = useState(0)

//   const file = mockFiles.find((f: { id: string | undefined }) => f.id === id) || mockFiles[0]

//   const handleLike = () => {
//     setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
//     setLiked(!liked)
//   }

//   const handleComment = (e: { preventDefault: () => void }) => {
//     e.preventDefault()
//     console.log("Comment submitted:", comment)
//     setComment("")
//   }

//   return (
//     <Container sx={{ py: 8 }}>
//       <Grid container spacing={6}>
//         {/* File Preview & Details */}
//         <Grid size={{ xs: 12, md: 8 }}>
//           <Typography variant="h4" gutterBottom>{file.title}</Typography>
//           <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
//             <Chip label={file.type} variant="outlined" />
//             {file.tags.map((tag: boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.Key | null | undefined) => (
//               <Chip key={tag} label={tag} color="primary" variant="outlined" />
//             ))}
//           </Box>

//           <Paper variant="outlined" sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <Box textAlign="center">
//               <InsertDriveFileIcon sx={{ fontSize: 60, color: "gray" }} />
//               <Typography variant="body2" color="textSecondary">
//                 Pré-visualização do arquivo
//               </Typography>
//               <Button variant="outlined" sx={{ mt: 2 }} startIcon={<FileOpenIcon />}>Abrir Visualização</Button>
//             </Box>
//           </Paper>

//           <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//             <Button variant="outlined" onClick={handleLike} startIcon={<ThumbUpIcon color={liked ? "primary" : "inherit"} />}>
//               Útil ({file.likes + likeCount})
//             </Button>
//             <Button variant="outlined" startIcon={<DownloadIcon />}>Download</Button>
//             <Button variant="outlined" startIcon={<ShareIcon />}>Compartilhar</Button>
//           </Box>

//           <Box mt={4}>
//             <Typography variant="h6">Descrição</Typography>
//             <Typography color="text.secondary" mt={1}>{file.description || "Sem descrição disponível."}</Typography>
//           </Box>

//           <Divider sx={{ my: 4 }} />

//           <Box>
//             <Box display="flex" alignItems="center" justifyContent="space-between">
//               <Typography variant="h6">Comentários</Typography>
//               <Chip label={`${mockComments.length}`} icon={<CommentIcon fontSize="small" />} />
//             </Box>

//             <Box component="form" onSubmit={handleComment} mt={2}>
//               <TextField
//                 fullWidth
//                 multiline
//                 minRows={3}
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 placeholder="Adicione um comentário..."
//               />
//               <Box display="flex" justifyContent="flex-end" mt={1}>
//                 <Button type="submit" disabled={!comment.trim()}>Comentar</Button>
//               </Box>
//             </Box>

//             <Box mt={3}>
//               {mockComments.map((c) => (
//                 <Paper key={c.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
//                   <Typography variant="subtitle2">{c.user}</Typography>
//                   <Typography variant="body2" color="text.secondary">{c.content}</Typography>
//                 </Paper>
//               ))}
//             </Box>
//           </Box>
//         </Grid>

//         {/* Sidebar */}
//         <Grid size={{ xs: 12, md: 4 }}>
//           <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
//             <Typography fontWeight="bold">Informações do Material</Typography>
//             <Box mt={2} display="flex" flexDirection="column" gap={2}>
//               <Box display="flex" gap={1} alignItems="center">
//                 <InsertDriveFileIcon fontSize="small" />
//                 <Typography variant="body2">{file.course} ({file.courseCode})</Typography>
//               </Box>
//               <Box display="flex" gap={1} alignItems="center">
//                 <PersonIcon fontSize="small" />
//                 <Typography variant="body2">{file.professor}</Typography>
//               </Box>
//               <Box display="flex" gap={1} alignItems="center">
//                 <CalendarMonthIcon fontSize="small" />
//                 <Typography variant="body2">{file.semester}</Typography>
//               </Box>
//               <Box display="flex" gap={1} alignItems="center">
//                 <Avatar sx={{ width: 24, height: 24 }} src="/placeholder.svg" />
//                 <Typography variant="body2">{file.uploader || "Anônimo"}</Typography>
//               </Box>
//               <Box display="flex" gap={1} alignItems="center">
//                 <CalendarMonthIcon fontSize="small" />
//                 <Typography variant="body2">{new Date(file.uploadDate).toLocaleDateString("pt-BR")}</Typography>
//               </Box>
//             </Box>
//           </Paper>

//           <Alert severity="info">
//             Encontrou algum problema com este material?{' '}
//             <MuiLink href="/report" underline="hover">Reportar</MuiLink>
//           </Alert>

//           <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
//             <Typography fontWeight="bold">Materiais Relacionados</Typography>
//             <Box mt={2} display="flex" flexDirection="column" gap={1}>
//               {mockFiles.filter((f: { courseCode: any; id: any }) => f.courseCode === file.courseCode && f.id !== file.id).slice(0, 3).map((f) => (
//                 <MuiLink key={f.id} href={`/file/${f.id}`} underline="hover">
//                   <Box display="flex" gap={1} alignItems="center">
//                     <InsertDriveFileIcon fontSize="small" />
//                     <Box>
//                       <Typography variant="body2" noWrap>{f.title}</Typography>
//                       <Typography variant="caption" color="text.secondary">{f.type} • {f.semester}</Typography>
//                     </Box>
//                   </Box>
//                 </MuiLink>
//               ))}
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Container>
//   )
// }
