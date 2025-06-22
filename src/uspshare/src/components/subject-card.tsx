import React from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Stack,
  Box,
} from "@mui/material";

// Material-UI Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";

export function SubjectCard({ subject, isExpanded, onClick }: { subject: any; isExpanded: boolean; onClick: () => void; }) {
  // Count unique file types
  const fileTypes = subject.files.reduce((types: { [x: string]: any; }, file: { type: string | number; }) => {
    types[file.type] = (types[file.type] || 0) + 1;
    return types;
  }, {});

  // Count unique professors
  const professors = new Set(subject.files.map((file: { professor: any; }) => file.professor));

  return (
    <Card
      variant="outlined"
      sx={{
        transition: "box-shadow 200ms, border-color 200ms",
        borderColor: isExpanded ? "primary.main" : "divider",
        borderWidth: isExpanded ? "1px" : "1px",
        "&:hover": {
          boxShadow: 3,
          borderColor: isExpanded ? "primary.main" : "grey.400",
        },
      }}
    >
      <CardActionArea onClick={onClick} component="div">
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack spacing={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Header: Course Name + Code Chip */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h6" component="h3" noWrap>
                {subject.course}
              </Typography>
              <Chip
                label={subject.courseCode}
                variant="outlined"
                size="small"
              />
            </Stack>

            {/* Sub-header: Stats and Type Chips */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={{ xs: 1.5, sm: 3 }}
              flexWrap="wrap"
              color="text.secondary"
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <DescriptionOutlinedIcon sx={{ fontSize: "1rem" }} />
                <Typography variant="body2">
                  {subject.files.length} materiais
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <GroupOutlinedIcon sx={{ fontSize: "1rem" }} />
                <Typography variant="body2">
                  {professors.size} professor{professors.size !== 1 ? "es" : ""}
                </Typography>
              </Stack>
            </Stack>

            {/* File Type Chips */}
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {Object.entries(fileTypes).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${count} ${type}${count !== 1 ? "s" : ""}`}
                  size="small"
                  sx={{
                    bgcolor: "action.selected",
                    fontSize: "0.75rem",
                    height: "22px",
                  }}
                />
              ))}
            </Stack>
          </Stack>

          {/* Chevron Icon */}
          <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
            {isExpanded ? (
              <ExpandMoreIcon color="primary" />
            ) : (
              <ChevronRightIcon />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}