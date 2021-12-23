import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { styled } from "@mui/system";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { server_url } from "../urls";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontWeight: "bold",
    backgroundColor: "grey",
    // color: "white",
    [`&.${tableCellClasses.input}`]: {
      backgroundColor: "white",
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: "pointer",
  "&:nth-of-type(odd)": {
    // backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    // border: 0,
  },
}));

export const airQualityIndexColors = [
  {
    min: 0,
    max: 51,
    color: "rgb(0,128,0)",
    condition: "Good",
    band: 1,
    secondaryColor: "rgb(0,100,0)",
  },
  {
    min: 51,
    max: 101,
    color: "rgb(133,187,101)",
    condition: "Satisfactory",
    band: 2,
    secondaryColor: "rgb(116,195,101)",
  },
  {
    min: 101,
    max: 201,
    color: "rgb(255,255,0)",
    condition: "Moderate",
    band: 3,
    secondaryColor: "rgb(255,196,12)",
  },
  {
    min: 201,
    max: 301,
    color: "rgb(255,165,0)",
    condition: "Poor",
    band: 4,
    secondaryColor: "rgb(255,140,0)",
  },
  {
    min: 301,
    max: 401,
    color: "rgb(255,0,0)",
    condition: "Very Poor",
    band: 5,
    secondaryColor: "rgb(178,34,34)",
  },
  {
    min: 401,
    max: 500,
    color: "rgb(178,34,34)",
    condition: "Severe",
    band: 6,
    secondaryColor: "rgb(128,0,0)",
  },
];

export const getAirQualityIndexObj = (aqi) => {
  return airQualityIndexColors.find(
    (aqic) => aqi >= aqic.min && aqi < aqic.max
  );
};

export const getAirQualityIndexObjByFieldName = (
  fieldName = "",
  value = ""
) => {
  return airQualityIndexColors.find((aqic) => aqic[fieldName] === value);
};

function descendingComparator(a, b, orderBy) {
  switch (orderBy) {
    case "updated_at":
      if (b[orderBy].diff(a[orderBy]) < 0) return -1;
      else if (b[orderBy].diff(a[orderBy]) > 0) return 1;
      else return 0;
    case "aqi":
      if (Number(b[orderBy]) < Number(a[orderBy])) return -1;
      else if (Number(b[orderBy]) > Number(a[orderBy])) return 1;
      else return 0;
    case "condition":
      if (
        Number(getAirQualityIndexObjByFieldName("condition", b[orderBy]).band) <
        Number(getAirQualityIndexObjByFieldName("condition", a[orderBy]).band)
      )
        return -1;
      else if (
        Number(getAirQualityIndexObjByFieldName("condition", b[orderBy]).band) >
        Number(getAirQualityIndexObjByFieldName("condition", a[orderBy]).band)
      )
        return 1;
      else return 0;
    default:
      if (b[orderBy] < a[orderBy]) return -1;
      else if (b[orderBy] > a[orderBy]) return 1;
      else return 0;
  }
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "city",
    numeric: false,
    disablePadding: false,
    label: "City",
    center: false,
  },
  {
    id: "aqi",
    numeric: true,
    disablePadding: false,
    label: "Current AQI",
    center: true,
  },
  {
    id: "updated_at",
    numeric: true,
    disablePadding: false,
    label: "Last Updated",
    center: true,
  },
  {
    id: "condition",
    numeric: true,
    disablePadding: false,
    label: "Condition",
    center: false,
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    showCheckBox,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <StyledTableRow>
        {showCheckBox && (
          <StyledTableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": "select all desserts",
              }}
              style={{ visibility: "hidden" }}
            />
          </StyledTableCell>
        )}
        {headCells.map((headCell) => (
          <StyledTableCell
            key={headCell.id}
            align={
              headCell.center ? "center" : headCell.numeric ? "right" : "left"
            }
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              style={{ marginLeft: headCell.center ? "26px" : "" }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  showCheckBox: PropTypes.bool.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Air Quality Index
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const Main = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("city");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [airQualityData, setairQualityData] = useState([]);
  const [compare, setCompare] = useState(false);
  const navigate = useNavigate();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = airQualityData.map((n) => n.city);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, city) => {
    const selectedIndex = selected.indexOf(city);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, city);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeFormLabel = (event) => {
    const { name, checked } = event.target;
    switch (name) {
      case "dense":
        setDense(checked);
        break;
      case "compare":
        setCompare(checked);
        break;
      default:
        break;
    }
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - airQualityData.length)
      : 0;

  const handleClickRow = (city) => {
    navigate(`/city/${city}`);
  };

  useEffect(() => {
    // Wesb Socket Url
    const ws = new WebSocket(server_url);

    const createData = (city, aqi) => {
      return {
        city,
        aqi,
        updated_at: moment(new Date()),
        previous_band: getAirQualityIndexObj(aqi),
        band: getAirQualityIndexObj(aqi),
        condition: getAirQualityIndexObj(aqi).condition,
      };
    };

    ws.onmessage = async (event) => {
      const { data } = event;
      const json = JSON.parse(data);
      let tempData = [...airQualityData];
      json.forEach((js) => {
        let index;
        let found = tempData.find((td, i) => {
          index = i;
          return td.city === js.city;
        });
        if (tempData.length > 0 && found) {
          tempData[index].aqi = js.aqi.toFixed(2);
          tempData[index].updated_at = moment(new Date());
          tempData[index].previous_band = tempData[index].band;
          tempData[index].band = getAirQualityIndexObj(
            tempData[index].aqi
          ).band;
          tempData[index].condition = getAirQualityIndexObj(
            tempData[index].aqi
          ).condition;
        } else {
          tempData.push(createData(js.city, js.aqi.toFixed(2)));
        }
      });
      setairQualityData(tempData);
    };

    return () => {
      ws.close();
    };
  }, [airQualityData]);

  useEffect(() => {
    const compare = selected.join("-");
    if (selected.length === 2) navigate(`/compare/${compare}`);
  }, [selected, navigate]);

  return (
    <Box sx={{ maxWidth: 750, margin: "40px auto 0 auto" }}>
      <Paper sx={{ maxWidth: 750, mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={airQualityData.length}
              showCheckBox={compare}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(airQualityData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.city);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <StyledTableRow
                      hover
                      className={`${
                        Math.abs(row.band - row.previous_band) >= 3 && "quadrat"
                      }`}
                      onClick={(event, name) =>
                        compare
                          ? handleClick(event, row.city)
                          : handleClickRow(row.city)
                      }
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.city}
                      selected={isItemSelected}
                    >
                      {compare && (
                        <StyledTableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              "aria-labelledby": labelId,
                            }}
                            style={{ zIndex: 100 }}
                          />
                        </StyledTableCell>
                      )}
                      <StyledTableCell component="th" id={labelId} scope="row">
                        {row.city}
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        style={{
                          color: getAirQualityIndexObj(row.aqi).color,
                        }}
                      >
                        {row.aqi}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {row.updated_at.fromNow()}
                      </StyledTableCell>
                      <StyledTableCell
                        align="right"
                        style={{
                          color: getAirQualityIndexObj(row.aqi).color,
                        }}
                      >
                        {row.condition}
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              {emptyRows > 0 && (
                <StyledTableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <StyledTableCell colSpan={6} />
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={airQualityData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeFormLabel} />}
        label="Dense padding"
        name="dense"
      />
      {/* <div style={{ display: "flex", flexDirection: "column" }}> */}
      <FormControlLabel
        control={<Switch checked={compare} onChange={handleChangeFormLabel} />}
        label="Compare Cities"
        name="compare"
      />
      <span style={{ fontSize: 12, marginLeft: -10 }}>
        {compare && "( select any 2 cities )"}
      </span>
      {/* </div> */}
    </Box>
  );
};

export default Main;
